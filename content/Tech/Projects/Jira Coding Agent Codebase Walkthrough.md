---
title: "Jira Coding Agent: Codebase Walkthrough"
description: "A file-by-file walkthrough of my Jira coding agent: how a ticket moves through the code, the design decisions behind it, and the gaps I found reviewing it."
---

> [Project Link](https://github.com/elampt/jira-coding-agent) · read from the code at commit `d12f7f8`

A full read of my Jira coding agent: what every file does, how one ticket moves through the code, why it's built this way, and what I'd fix. Short on time? Read sections 1, 5 and 7.

Mental model: there are **two codebases**. This repo is the agent server. The **target repo** (`Nirachan8/codingAgentUI`, a Create React App) is cloned fresh for every ticket into `workspace/<ISSUE_KEY>/codingAgentUI/`, and that clone is what gets edited, tested, screenshotted and pushed.

---

## 1. The life of one ticket (call chain)

1. **Jira → `POST /webhook`** (`src/server/app.py: handle_webhook`). The body is validated by `JiraWebhookPayload` (`src/server/models.py`). For `jira:issue_created` it queues `process_new_ticket` in FastAPI `BackgroundTasks` and returns 200 right away (Jira expects a fast reply).
2. **`process_new_ticket`** (setup, outside the graph):
   - Jira status → "In Progress" (`jira_client.update_status`, which uses Jira transitions).
   - `git_ops.clone_repo` → `workspace/KEY/repo` (wipes any old folder for that key).
   - `npm install` (120 s timeout), then `discard_tracked_changes` so npm's lockfile rewrite never lands in the PR.
   - `indexer.index_repo` → builds the FAISS index.
   - **Before** screenshot (`screenshotter._capture_screenshot`: start dev server → Playwright MCP → stop server), saved inside the repo at `agent-screenshots/before.png`.
   - `create_branch` → `agent/KEY`.
   - Saves `_session_store[KEY]` (repo path, branch, before path, summary, description).
   - `agent.invoke(..., config={"configurable": {"thread_id": KEY}, callbacks: [LangFuse]})`.
3. **The graph** (`src/agent/graph.py`): `parse → search → plan → risk gate → [wait_approval] → write → test → [fix → write → test, max 3] → END`.
4. **If it paused:** `agent.get_state(cfg).next` is non-empty → record outcome `awaiting_approval` → Jira "In Review" → the background task ends. Nothing is running; the state sits in the `MemorySaver` checkpointer under `thread_id = KEY`.
5. **Human comments "approve"** → webhook `comment_created` → `process_comment`: skip comments starting with 🤖 (the agent's own) → ignore unless a paused session exists → strip `[~accountid:...]` mentions → must be exactly approve/approved/reject/rejected → `agent.invoke(Command(resume="approved"), same thread_id)`. LangGraph re-runs `wait_for_approval` from the top, and `interrupt()` now returns the reply.
6. **`_finalize`** (after the graph ends):
   - rejected → "🤖 Task cancelled", status Done.
   - environment failure → comment with the error tail; **status left alone** (a person must fix the server).
   - tests still failing after retries → comment with the last 500 chars of output, status Done.
   - success → **after** screenshot → `commit_changes` (`git add .`) → `push_branch` (token put in the remote URL; deletes an old remote branch of the same name first) → PR body (plan summary + files **from the commit** + raw GitHub screenshot URLs) → `create_pull_request` (PyGithub, base `main`) → Jira comment with the PR link → "In Review" → outcome `success`.
   - Any exception → outcome `error`, "🤖 Agent failed: ..." comment.

**LLM calls per run:** parse (1) + plan (1) + approval summary (1, only if paused) + fixer (0–3). A clean low-risk run is **2 calls**, about 2.4K–5K tokens, which at the list price in `config.yaml` ($0.15 / $0.60 per million) is **well under a cent**. Each call can retry up to 3 times on malformed output.

---

## 2. File by file

### Root
| File | What it is |
|---|---|
| `config.yaml` | Non-secret settings: LLM (`groq`, `openai/gpt-oss-120b`, token prices for cost estimates), embeddings (local `all-MiniLM-L6-v2`), FAISS index path, target repo URL + `branch_prefix: agent/` + test/lint/dev-server commands, Jira `project_key: KAN` + **`auto_approve_risk_levels: ["low"]`**, screenshot dir |
| `.env.example` | Secret names: `GROQ_API_KEY`, `JIRA_BASE_URL/EMAIL/API_TOKEN`, `GITHUB_TOKEN`, `LANGFUSE_*` |
| `pyproject.toml` | Dependencies (FastAPI, LangGraph/LangChain/langchain-groq, faiss-cpu, sentence-transformers, torch, mcp, langfuse, atlassian-python-api, PyGithub, GitPython). **torch routed to the CPU-only index** (image 6 GB → 800 MB). Ruff and PyRight config |
| `uv.lock` | Pinned versions for reproducible installs |
| `Dockerfile` | Multi-stage: builder runs `uv sync --no-dev --frozen`; runtime is python:3.10-slim + git, curl, nodejs, npm; **non-root `appuser`**; `ENABLE_VISUAL_VERIFICATION=false` (no Chromium in the image, so **no screenshots in production**); healthcheck on `/health`; `uvicorn` on 8000. Only `src/` and `config.yaml` go into the image |
| `.dockerignore` / `.gitignore` | Keep `.env`, `workspace/`, `data/`, `screenshots/` and eval cache/results out |
| `Makefile` | `install`, `run`, `lint`, `format`, `type-check`, `check`, `evals`, `report`, `clean` |
| `CLAUDE.md` | Architecture notes and commands for Claude Code (AI coding assistant) working in the repo |
| `README.md` | Overview, Mermaid diagrams, AWS deployment (EC2 t3.micro Mumbai, Elastic IP, Cloudflare DNS, Caddy + Let's Encrypt, container bound to 127.0.0.1), design decisions, known limitations |
| `assets/` | The three README screenshots (PR, Jira approval comment, LangFuse trace) |
| `tests/` | **Empty.** No unit tests; the eval harness is the test layer |

### `src/server/`
| File | Key parts |
|---|---|
| `app.py` | `handle_webhook` (routes the two events), `process_new_ticket` (setup + first invoke), `process_comment` (approval → resume), `_finalize` (results → commit/push/PR/Jira), `_agent_config` (thread_id + LangFuse callback + metadata), `_session_store` (in-memory dict), `SCREENSHOT_DIR_IN_REPO = "agent-screenshots"`, `GET /health` |
| `models.py` | Pydantic models for only the fields used: `webhookEvent`, `issue.key`, `fields.summary/description/status/issuetype`, optional `comment.body`. Extra fields are ignored. **The comment author isn't modelled**, which is why the approver can't be checked today |

### `src/agent/`
| File | Key parts |
|---|---|
| `graph.py` | `build_agent()` wires 7 nodes into `StateGraph(AgentState)`, compiled with `MemorySaver`. Three routers: `should_wait_for_approval` (risk in config list → write, else wait; unknown values pause, but **a missing key defaults to "low"**), `should_proceed_after_approval` (approved → write, else END), `should_retry_or_end` (pass → END; env failure → END; retries ≥ `MAX_RETRIES = 3` → END; else fix). `agent = build_agent()` is created once at import |
| `state.py` | `AgentState` TypedDict, grouped by the node that writes each field: inputs (`issue_key, summary, description, repo_path, branch_name`), `ticket_plan`, `relevant_files`, `edit_plan` + `plan_summary`, `changes_made`, `test_passed / test_output / environment_failure / retry_count`, screenshot paths (unused), `approval_status`. Nodes return **partial updates** and LangGraph merges them |

### `src/agent/nodes/` (one file per step)
| Node | Input → output | LLM? | Details worth knowing |
|---|---|---|---|
| `parser.py` → **parse** | summary, description → `ticket_plan {intent, component_hints, risk_level}` | Yes, structured (`TicketPlanOutput`) | Risk rubric in the prompt: low = text/CSS, medium = simple props, high = state, new functions, routing, several files, refactor. **Risk comes from the ticket text alone, before any code is seen.** `risk_level` is a free `str`, not an enum |
| `searcher.py` → **search** | hints, summary → `relevant_files [{path, content}]` | No | RAG (`retrieve_similar(summary, top_k=5)`) + `grep -rl` for each hint over `src/`, skipping node_modules/.git/build/dist/coverage. RAG results first, then grep, deduped by path |
| `planner.py` → **plan** | ticket + files → `edit_plan [{file, old_string, new_string}]`, `plan_summary` | Yes (`EditPlanOutput`) | Rules in the prompt: exact old_string, minimum change, only provided files, update tests in the same plan, no new npm packages, anchor new imports to an existing line, **fewer, larger edits** |
| `approver.py` → **wait_approval** | plan → `approval_status` | Yes (`ChangeSummary`: summary + 2–4 risk concerns), with a fallback if it fails | Posts a Jira comment: header with risk, LLM summary, risk concerns, files, **the full old/new code of every edit**, and "reply approve or reject". Then `interrupt()`. `_posted_approvals` set stops a duplicate comment, because **on resume the node re-runs from the top** |
| `writer.py` → **write** | edit_plan → `changes_made` | No | Literal `str.replace(old, new, 1)` (first match only). File missing or old_string not found → **skipped with a warning, not a failure**. Empty old_string → prepend |
| `tester.py` → **test** | repo → `test_passed, test_output, environment_failure` | No | Runs `npm test` with `CI=true` (Jest runs once, no watch mode), 120 s timeout, keeps the last 3000 chars. "Command not found" → `environment_failure=True`. **A timeout is not an environment failure** (an agent edit can cause an infinite loop the fixer can fix). Lint is in config but **not run** |
| `fixer.py` → **fix** | test output + files → new `edit_plan`, `retry_count + 1` | Yes (`FixPlanOutput`) | **Reads files from disk, not state** (attempt 2 must see attempt 1's edits). File priority: paths named in the failure output (regex) → files already changed (`worktree_changed_files`) → search results → fallback all of `src/`. Budget `MAX_CONTEXT_CHARS = 16000` (~4K tokens) because of Groq's 8K tokens/minute. Prompt: diagnose first (import/syntax → main code; assertion → test file) |
| `screenshotter.py` | — | No | `_capture_screenshot(repo, path, label)` is called **directly from app.py**, outside the graph. The `screenshot_before/after` node functions in this file are **not wired in** (leftover). Off when `ENABLE_VISUAL_VERIFICATION=false` |

### `src/` top-level modules
| File | Key parts |
|---|---|
| `llm.py` | `get_llm()` builds `ChatGroq` from config (only "groq"; anything else raises a clear error). `invoke_structured(schema, messages)` = `with_structured_output` + **retry up to 3 times on Groq's `tool_use_failed` / `json_validate_failed` 400s** (the model emitting a bad tool call), then `LLMCallError` with a short message for Jira. Rate limits and 5xx are retried by the Groq SDK |
| `config.py` | `AppConfig` (Pydantic models for config.yaml) + `EnvSecrets` (pydantic-settings reads `.env`). Loaded once at import as `config` / `secrets`. A bad config.yaml fails at startup |
| `observability.py` | `get_langfuse_handler()` (None if keys are missing, so tracing never blocks the agent). `trace_metadata()` (session id = ticket key so the paused and resumed halves group together; trace name `jira-agent-run`; tags `prod`/`eval` + model). `record_run_outcome()` writes categorical scores `outcome` and `risk_level` with a **fixed score id per ticket** (awaiting_approval → success updates in place) and never raises. `classify_outcome()` is used by the evals |

### `src/integrations/` (thin wrappers, one per system)
| File | Key parts |
|---|---|
| `jira_client.py` | atlassian-python-api with **basic auth: my email + my API token**. `add_comment`, `update_status` (looks up allowed transitions, then executes the one matching the name), `get_issue` (unused) |
| `github_client.py` | PyGithub with **my personal access token**. `create_pull_request(head=branch, base="main")`, `_get_repo_full_name()` from the config URL |
| `git_ops.py` | GitPython. `clone_repo` (per-ticket folder), `create_branch`, `discard_tracked_changes`, `commit_changes` (`git add .`), `worktree_changed_files`, `files_in_last_commit`, `push_branch` (token embedded in the remote URL for containers; deletes the old remote branch, then pushes) |

### `src/rag/`
| File | Key parts |
|---|---|
| `chunker.py` | **One chunk per file** under `src/` (.js/.jsx/.ts/.tsx/.css/.scss), skipping node_modules, build, dist, coverage, public. `embed_text` = path + first 1500 chars |
| `embedder.py` | Loads the MiniLM model **once per process** behind a `threading.Lock` (tickets run in background threads). This fix came from the trace report: loading took ~5 s per call versus ~0.01 s to embed a query |
| `indexer.py` | Embeds the chunks (384-dim) → `faiss.IndexFlatL2` (exact brute-force search, fine for small repos) → writes `data/codebase.index` + `codebase_metadata.json` (FAISS stores only vectors, so path and content live in the sidecar) |
| `retriever.py` | Embeds the query with the same model, `index.search`, maps ids back to metadata, returns `{path, content}` (same shape as grep results so the searcher can merge them) |

### `src/mcp/playwright_client.py`
MCP **client** over **stdio**: spawns `npx @playwright/mcp@latest --headless`, `session.initialize()`, then calls the tools `browser_navigate` and `browser_take_screenshot` (fullPage). `take_screenshot()` wraps the async code with `asyncio.run` because the rest is synchronous. **Version is `@latest`, not pinned.**

### `src/tools/dev_server.py`
`start_dev_server` (`npm start` with `BROWSER=none`, `CI=false`, its own process group), `wait_for_server` (polls the URL every second, 60 s), `stop_dev_server` (SIGTERM to the whole group, SIGKILL if it hangs). Port 3000 is fixed.

### `evals/`
| File | Key parts |
|---|---|
| `cases.yaml` | Six `kind: behavior` cases, each with `why`, `ticket`, optional `setup` / `env` / `inject` / `resume`, and an `expect` block. Documents every field at the top |
| `run.py` | Per run: copy the pinned fixture to a temp dir + case setup files → `git init` + baseline commit → clone the cached node_modules (`cp -c`, APFS copy-on-write) → temp FAISS index via `mock.patch` → Jira comment stubbed → fault injection (`llm_always_fails` patches `get_llm`; `no_node` strips PATH) → run the **real graph**, resume if the case says so → `evaluate()` checks the end state (paused?, approval status, tests, env failure, retries min/max, LLM call cap, error type, files changed, file contains / not contains). `UsageCounter` callback counts calls and tokens. Saves `results/<UTC>_<git sha>.json` with diff and log lines, compares with the previous run (REGRESSION / BELOW BAR), exit code 1 if flagged. `--repeat`, `--cases`, `--trace`, `--keep`. Paces itself by tokens to stay under Groq's per-minute cap |
| `README.md` | How to run, what each case proves, reading results, cost (~19K tokens per suite), adding a case, design notes |
| `fixtures/react-app/` + `FIXTURE_SOURCE` | Trimmed copy of the target app pinned to commit `20d1384`, so results don't move when the upstream repo changes |

The six cases:
- `low_risk_text_change`: no pause, passes first try (`retries_max: 0`).
- `high_risk_pauses_then_approves`: pauses before writing; `useState` present after approve.
- `high_risk_rejected_changes_nothing`: `no_files_changed`.
- `forced_test_failure_self_heals`: a hidden test in `src/build/` (which both search halves skip) breaks when the text gets longer; the fixer must repair it **and** the ticket's text must still be there.
- `environment_failure_skips_fixer`: npm off PATH; `llm_calls_max: 2`, so only parse + plan.
- `llm_failure_ends_cleanly`: every call raises; must end with `LLMCallError`, no files changed.

### `scripts/`
| File | Key parts |
|---|---|
| `demo_local.py` | Runs the graph against a repo already on disk, without Jira, GitHub, clone or install. `agent.stream(stream_mode="updates")` prints each node's state update. `--no-jira` prints the approval comment instead of posting; `--auto-resume` resumes in the same process. (`--resume` in a separate process can't find the state, since `MemorySaver` lives in the old process's RAM) |
| `trace_report.py` | Reads LangFuse's public API (basic auth, honours 429 Retry-After). Per step: runs, median / p95 / max seconds, average tokens. Per ticket: tokens, wall time, estimated cost. Outcome-by-risk table. `--env prod/eval`, `--save`. **This report showed the embedding reload was the slowest part** |

---

## 3. Architecture decisions and their trade-offs

| Decision | Why | The trade-off |
|---|---|---|
| LangGraph with fixed nodes, LLM only inside nodes | I wanted the steps and the routing in code. The model parses, plans, summarises and fixes; it never decides the next step | Less flexible than a free tool-calling agent, but predictable, testable, and easy to put a gate in |
| Routers are plain Python functions | Approve/retry/stop decisions shouldn't depend on the model | — |
| Structured output with Pydantic everywhere | Typed, validated results; no parsing free text | Groq's tool-call errors, handled by the retry in `llm.py` |
| `old_string → new_string` edits | Line numbers shift; diffs and full-file rewrites are easy for the model to break. Exact strings either match or don't | A wrong match is skipped, not flagged (gap 7 below) |
| "Fewer, larger edits" in the prompt | Chains of small dependent edits failed often | Bigger edits are harder to review |
| RAG + grep | Grep finds exact strings from the ticket; RAG finds "navbar" when the file says "header" | — |
| One chunk per file, `IndexFlatL2`, local MiniLM | React components are usually one per file; exact search is fine at this size; local embeddings are free and need no API key | Won't scale to huge repos (then IVF or a vector DB) |
| Plan **before** the gate | The reviewer approves the real edits (full code is in the comment), not a vague intent | The risk *decision* still comes from the ticket text (gap 5) |
| Approval on Jira comments | No new UI; people stay where they already work; reuses the same webhook | Comments are weak identity (gap 2) |
| `interrupt()` + checkpointer, `thread_id = issue key` | The run can stop for hours and pick up exactly where it paused | `MemorySaver` is RAM only. Production: Postgres/SQLite checkpointer |
| `_session_store` separate from graph state | Server-side context (branch, screenshot path) is needed by `_finalize`, which runs outside the graph | Another in-memory store lost on restart |
| Self-heal capped at 3; env failures skip the fixer | Bounded cost; an LLM can't fix a missing npm, and given the chance it invents edits | A timeout counts as a code failure on purpose |
| Fixer reads from disk with a context budget | Each attempt sees the current code; the budget fits Groq's free tier and stops it touching unrelated files | Might miss a file outside the budget |
| Never merges; PR to `main` | A person always merges | — |
| Files list from git, not the plan | The fixer overwrites `edit_plan`, so the plan under-reports | — |
| Discard lockfile churn | `npm install` rewrites package-lock.json; without this every PR had thousands of noise lines | — |
| Screenshots via MCP, outside the graph | The "before" shot must happen before any change; keeps the graph (and evals) free of slow browser work | Off in Docker (no Chromium) |
| config.yaml vs .env | Settings committed, secrets not; model swap is a one-line change | — |
| One LLM factory | When Groq retired the Llama model, the switch was one config line | Only Groq implemented |
| LangFuse with session = ticket, outcome scores | One story per ticket across pause/resume; filter by how runs ended | Cost is an estimate at list price |
| Docker multi-stage, CPU torch, non-root, Caddy | Small image, HTTPS with auto-renewal, the container isn't exposed directly | Single small instance |

---

## 4. Numbers worth remembering
- 7 nodes, 3 routers. `MAX_RETRIES = 3` fixes; up to 3 retries per malformed LLM response.
- Timeouts: npm install 120 s, tests 120 s, dev server startup 60 s.
- Fixer context 16,000 chars (~4K tokens). Groq free tier: 8K tokens/minute, ~200K/day.
- Test output kept: last 3000 chars (Jira gets the last 500, or 300 for env failures).
- Embeddings: MiniLM, 384 dimensions, first 1500 chars per file, top 5 results.
- Embedding model load ~5 s vs ~0.01 s per query; it was over half of a ticket's run time, and fixing it roughly halved a run.
- Eval: 6 cases, ~2.4K–5K tokens per run, ~19K per full suite.
- Docker image 6 GB → ~800 MB. EC2 t3.micro, ap-south-1.

---

## 5. Known gaps (my own review)

Three questions I now ask of any agent: **what is it allowed to do, who is acting, and how do you stop it?** Reading my own code with those in mind, most important first:

1. **The writer doesn't keep edits inside the repo.** `writer.py` does `repo_path / edit["file"]` with no check, so a `../` path or an absolute path points outside the clone. If the file exists and old_string matches, it gets written. "Only edit files that were provided to you" is a **prompt rule, not a control**, so a crafted ticket could try to steer the model into editing files outside the clone, including the agent's own config. Those edits also wouldn't show up in the PR, because `git add .` only sees the clone.
   **Fix:** resolve the path and require it to be inside the repo (`resolved.is_relative_to(repo.resolve())`), allow only `src/`, and flag test-file edits. Deny it in code, before it runs.
2. **Anyone who can comment can approve.** The approver's identity isn't checked (the webhook model doesn't even read the comment author). **Fix:** accept approval only from an allowlist of Jira account IDs and record who approved, and when, in the trace.
3. **The agent and I share an identity.** It uses my personal Jira and GitHub tokens (long-lived, broad), and its comments are told apart from mine only by the 🤖 prefix. **Fix:** a separate agent identity, such as a Jira service account and a GitHub App with short-lived, repo-scoped tokens.
4. **Approval covers the plan, not what happens after.** The human approves plan X; then up to three fixer rounds can make new edits that nobody approved. **Fix:** after the fix loop, compare the final diff with the approved plan; if new files or much bigger changes appear, ask again. Approval should have a scope.
5. **Risk is decided before the agent sees the code.** The parser rates risk from ticket text, so a misleading ticket can push itself to "low" and skip approval. By the time the gate runs, the actual plan exists but isn't used for the decision. `risk_level` is a free string, and a missing value defaults to "low". **Fix:** compute a rule-based risk from the plan (files touched, edit size, hooks or new functions, test files), take the higher of rules vs LLM, make `risk_level` a `Literal["low","medium","high"]`, and default to pause.
6. **Untrusted code runs next to the secrets.** `npm install` and `npm test` run code from the target repo as the same user, in the same container that has `.env` mounted (and the LangFuse keys are in the process environment passed to npm). The clone also keeps the GitHub token in its git config after push, and workspaces aren't cleaned up. **Fix:** run each job in a sandboxed container with no secrets and limited network, and clean up after.
7. **A skipped edit isn't a failure.** If no old_string matches, nothing changes, the original tests still pass, and the agent could open a PR containing only screenshots ("Files Changed: (none)"). **Fix:** zero applied edits ends the run as a failure. More generally, "tests pass" doesn't mean "the ticket is done".
8. **The Playwright MCP server isn't pinned:** `npx @playwright/mcp@latest`. A server update could change the tools under me. **Fix:** pin the exact version, like `uv.lock` does for Python.
9. **No webhook authentication.** Anyone who finds the URL can trigger a run. `jira.project_key` is loaded but unused, so any project pointed at the server triggers it. **Fix:** Jira's webhook secret with an HMAC signature check, and filter by project.
10. **No hard budget.** Cost is estimated per call in LangFuse, but the only cap is Groq's free-tier rate limit. **Fix:** a per-agent key with a spending cap, and track **cost per accepted ticket** (a PR merged without rework), including retries and failed runs.
11. **No clean way to stop it, and nothing survives a restart.** Stopping the server kills background tasks and loses in-flight work. There are three in-memory stores (`MemorySaver`, `_session_store`, `_posted_approvals`), so a restart during a pause means a later "approve" is ignored and the ticket sits in "In Review". It fails closed, but silently. **Fix:** a job queue with a pause switch, a persistent checkpointer, and revoking the agent's own credential as the real stop.
12. **Concurrency clashes.** Each ticket runs in parallel, but they share one FAISS index path, dev-server port 3000 and the Groq rate limit, and a duplicate webhook would start a second run on the same folder. **Fix:** a queue with workers, idempotency on the issue key, and a separate workspace, index and port per run.
13. **The README disagrees with the code in two places.** The diagram says "low / medium → Write" (the code only auto-approves **low**; medium pauses), and it says the test step runs `npm run lint` (only `npm test` runs).
14. **Failed and rejected tickets move to "Done"**, which hides failures on the board. A "Needs attention" status would be more honest.
15. **No unit tests.** The routers and the writer are pure functions and would be cheap to test. The evals cover the graph, **not** `_finalize` (commit, push, PR body).

---

## 6. What I'd change first for production
In order:
1. Path check and allowlist in the writer.
2. Approver allowlist from the comment author, and record who approved in the trace.
3. A separate agent identity (Jira service account, GitHub App with short-lived repo-scoped tokens).
4. Rule-based risk from the plan, fail closed, and re-approval if the fixer goes beyond the plan.
5. Each run in a sandboxed container with no secrets and limited network.
6. Webhook HMAC and idempotency on the issue key.
7. A queue with workers, a persistent checkpointer (Postgres), and a separate index and port per run.
8. A hard budget per agent key, and cost per accepted ticket as the main metric.

---

## 7. FAQ about the code

- **Why does `wait_for_approval` keep a `_posted_approvals` set?** When LangGraph resumes, it re-runs the whole node from the top, so everything before `interrupt()` runs twice. Without the set, the plan would be posted to Jira twice.
- **Why both a checkpointer and `_session_store`?** The checkpointer holds the graph's state. `_finalize` runs outside the graph and needs things like the branch name and screenshot path, so those live in the session store.
- **Why `thread_id = issue key`?** The approval comes in a different request, maybe hours later. The ticket key is the one thing both requests know, so it links the resume to the paused run.
- **What happens if the server restarts while a ticket is paused?** Both stores are in memory, so the state is gone. A later "approve" is ignored because there's no session. Nothing bad runs, but the ticket is stuck. Fix: persistent checkpointer.
- **How does it avoid reacting to its own comments?** Every agent comment starts with 🤖 and `process_comment` skips those first. It needs this because the agent posts as my Jira user. The right fix is a separate service account and filtering by author.
- **Why does an environment failure skip the fixer, but a timeout doesn't?** A missing npm can't be fixed by editing code, and the model would just invent edits. A timeout can be caused by the agent's own change (like an infinite loop), so the fixer gets a chance.
- **Why does the fixer read files from disk?** After the first fix attempt the files have changed. State still holds the original content, so attempt two would be working on stale code.
- **Why string replacement instead of diffs?** Line numbers move and generated diffs often don't apply. An exact string either matches or doesn't.
- **Why does the PR's file list come from git?** The fixer replaces `edit_plan` on each retry, so the plan alone under-reports what changed.
- **How do the evals stay isolated and repeatable?** Pinned fixture commit, a fresh temp copy with a git baseline per run, cached node_modules, a temp search index, Jira stubbed, and fault injection by patching one thing. Results are saved with the git sha and compared with the last run.
- **How is the hidden test hidden?** It lives in `src/build/`. Both the chunker and grep skip `build/`, so the planner never sees it, but Jest still runs it.
- **Doesn't `forced_test_failure_self_heals` reward editing a test?** In that case the test encodes the old behaviour (a two-word label), so updating it is the right fix. The guard is that the ticket's new text must still be in App.js. In general I'd flag any test edit for review.
- **Where does the LLM cost go?** Two calls on a clean run, more with approval or fixes. It's well under a cent per ticket at list price. The real cost is the person reviewing, which is why cost per accepted ticket is the number that matters.
- **Why is visual verification off in Docker?** The image doesn't include Chromium; the screenshots work locally. I'd add Chromium or run the browser as a separate service if they were needed in production.
- **How would you handle 50 tickets at once?** A queue with a few workers, idempotency on the issue key, a separate workspace, index and port per run, a persistent checkpointer, and a token budget per run so it stays under the rate limit.
