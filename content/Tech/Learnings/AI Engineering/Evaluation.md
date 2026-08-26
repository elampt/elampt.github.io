---
title: Evaluation — Interview Notes
date: 2026-08-26
tags: [ai, evaluation, llm-as-judge, interview-prep]
---

# Evaluation

> Across every 2026 hiring write-up, the same line recurs: *evaluation is the skill gap*. It's also my honest weak point — neither Bubble nor the Jira agent has an eval suite. That admission, followed by a specific plan, is a stronger answer than pretending otherwise.

---

## LLM-as-a-judge

**What it is.** Use a model to score outputs against a rubric. For open-ended generation it's the only thing that scales — you cannot hand-grade a thousand summaries after every prompt change, and n-gram metrics like BLEU and ROUGE correlate weakly with human judgement.

**The four biases you must be able to name.** Being able to list these is what separates knowing the technique from knowing its limits:

- **Position bias** — in a pairwise comparison, judges systematically prefer whichever answer came first. *Fix:* randomise the order and run each pair both ways, keeping only results that agree.
- **Verbosity bias** — longer answers score higher regardless of quality. *Fix:* say something about length in the rubric, or normalise.
- **Self-preference** — models rate their own outputs more highly. *Fix:* use a different model family as judge than the one being evaluated.
- **Poor calibration** — a judge's "7 out of 10" is not stable across runs or comparable across prompts. *Fix:* prefer pairwise comparison over absolute scoring, or use a small discrete scale with explicit anchors.

**Making it work in practice:**

- **Explicit rubrics, not "rate 1–10."** Define what each score means. "Faithful: every claim in the answer appears in the context" is checkable; "quality" is not.
- **Give the judge the source material**, not just the answer. It can't assess grounding without the ground.
- **Calibrate against humans on a subset.** Hand-label 30 examples and measure agreement with the judge. If it disagrees with you 30% of the time, its scores aren't usable yet.
- **Pair it with deterministic checks** — see below.

**G-Eval** is the named variant: use chain-of-thought to have the judge generate evaluation steps first, then score, weighting by token probabilities for finer-grained scores than integers allow.

---

## Deterministic checks — the underrated half

Not everything needs a model to evaluate. Cheap, exact assertions catch a surprising share of regressions and never drift:

- **Numeric grounding** — every number in the answer appears in the source. Catches the most damaging kind of summarisation hallucination.
- **Citation validity** — every cited source ID exists in the retrieved set.
- **Format compliance** — output parses as the expected JSON schema.
- **Refusal behaviour** — for a question with no answer in the corpus, does it actually say "I don't know"?
- **PII leakage** — regex for identifier patterns in output and logs.
- **Length and latency bounds**.

**The line worth saying:** *"in my experience the numeric-grounding check would catch more real regressions than the judge, and it costs nothing to run."*

---

## Offline vs online evaluation

| | Offline | Online |
|---|---|---|
| **Runs on** | A frozen labelled set | Live production traffic |
| **Answers** | "Did my change make the model better?" | "Is the product working for real people?" |
| **Examples** | precision, recall@k, faithfulness, format compliance | task completion, containment, escalation rate, p95 latency, cost/request, human override rate |
| **Cadence** | Every commit, gating merges | Continuous, with alerting |

**They disagree constantly**, and that's informative rather than a problem. A change that scores better offline can perform worse live, because real user queries are nothing like your test set.

**The bridge is a feedback loop:** sample production failures weekly, label them, add them to the offline set. Without it, your eval set slowly stops describing reality — which is the single most common way eval suites rot.

**Guardrail metrics** are the other half: separate what you're *optimising* from what must not *degrade*. Optimise task completion; guard latency, cost and escalation rate. A change lifting completion 5% while doubling p95 latency is a regression, and without named guardrails nobody notices until customers do.

---

## Golden datasets

**Build it like this:**

1. **Sample real inputs, not invented ones.** Production queries, real documents. Your own test cases are a biased sample — this is precisely why my chatbot's retrieval tuning wasn't reproducible.
2. **Stratify deliberately.** Over-sample the rare and hard cases: unusual formats, edge cases, adversarial phrasings. Random sampling gives you 95% easy examples and almost no signal.
3. **Measure inter-annotator agreement.** Two people label a subset. If humans agree only 80% of the time, that's your ceiling and your metric needs error bars.
4. **Freeze and version it.** A changing eval set makes results incomparable over time.
5. **Keep a held-out slice** you don't look at while tuning, so you can distinguish real improvement from overfitting to the eval set.
6. **Start small.** 30–50 well-chosen examples catch gross regressions and take an afternoon. The perfect thousand-example set never gets built.

---

## Red teaming

**What it is.** Deliberately adversarial testing before launch — trying to make the system do what it shouldn't.

**Categories to structure it by** (a checklist, not vibes):

- **Prompt injection** — instructions embedded in retrieved documents or user input
- **Jailbreaks** — role-play framings, hypotheticals, encoding tricks to bypass refusals
- **Data extraction** — attempts to recover training data, the system prompt, or other users' data
- **Scope violation** — in healthcare, getting clinical advice out of a system explicitly barred from giving it
- **Bias probing** — does behaviour change with names, dialects or demographic markers
- **Tool abuse** — for agents, inducing destructive or out-of-policy tool calls

**The discipline that makes it worth doing:** every successful attack becomes a **permanent regression test**. Red teaming that produces a one-off report and no test cases has bought you a snapshot, not a safety property.

---

## Benchmarks, and how to read them

MMLU (broad knowledge), HumanEval (code generation), GSM8K (grade-school maths reasoning), MT-Bench (multi-turn conversation).

**Read them sceptically.** Benchmark contamination is real — test items leak into training data, inflating scores. They measure general capability, not performance on *your* task. And a two-point difference on MMLU tells you nothing about which model will be better at summarising your clinical documents.

**The right answer to "which model is best?"** — "for what? I'd shortlist from benchmarks and then run my own eval set, because that's the only measurement that predicts my production behaviour."

---

## Comparing two models or prompts rigorously

The trap: run both on 20 examples, see 65% vs 60%, declare a winner. With 20 examples that difference is noise.

What to do instead: use a large enough sample that the difference exceeds the confidence interval; use **paired comparison** (same inputs through both systems) which is far more statistically powerful than independent samples; and report the interval, not just the point estimate.

Being able to say *"that difference isn't significant at that sample size"* is a genuinely differentiating answer.

---

## My honest position — and the plan

Neither project has an eval suite. I tuned Bubble's retrieval by reading outputs and judging them myself, which isn't reproducible and doesn't scale. The tells are visible in the code: `min_score` sits at −10.0 because I had no labelled data to tune it against, and chunking went from 322 to 82 chunks because I eyeballed the size distribution.

**What I'd build, in order:**

1. Freeze 30 real questions with hand-written reference answers
2. Measure retrieval (`recall@k`) and generation (faithfulness) **separately**, because they fail for different reasons and need opposite fixes
3. Add the deterministic numeric-grounding check
4. Wire it into CI so a prompt change is measured, not guessed at
5. Feed production failures back into the set weekly

Volunteering this before being asked turns a gap into evidence of judgement. Being caught out on it does the opposite.

---

## Quick reference

| Concept | One-line answer |
|---|---|
| LLM-as-judge | Scales for open-ended output; four biases — position, verbosity, self-preference, calibration |
| G-Eval | Judge generates evaluation steps via CoT, then scores |
| Deterministic checks | Numeric grounding, citation validity, schema compliance — cheap and exact |
| Offline vs online | Offline gates merges; online watches the product; feed failures back |
| Guardrail metrics | What must not degrade, named separately from what you're optimising |
| Golden set | Real inputs, stratified, frozen, versioned, held-out slice, start at 30 |
| Red teaming | Adversarial testing by category; every hit becomes a regression test |
| Benchmarks | Contaminated and generic — shortlist with them, decide with your own evals |

---

Related: [[RAG Advanced]] · [[AI Agents]] · [[Fine-Tuning and Alignment]]
