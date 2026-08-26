---
title: RAG Advanced — Interview Notes
date: 2026-08-26
tags: [ai, rag, retrieval, interview-prep]
---

# RAG Advanced

> Beyond chunking and reranking. These are the RAG questions that separate "I followed a tutorial" from "I've run one." Basics — chunking strategy, bi-encoder vs cross-encoder, faithfulness — are in the round-2 notes; this picks up after that.

---

## Naive vs Agentic vs Self-RAG

### Naive RAG

`query → embed → retrieve top-k → stuff into prompt → generate`. Retrieval happens on **every** turn, unconditionally.

The problems: "thanks!" costs a vector search and fills the context with irrelevant chunks. Follow-up questions get embedded without the conversation context, so "what about the second one?" retrieves nothing useful. And if the first retrieval was poor, there's no second chance.

### Agentic RAG

**Retrieval becomes a tool the model chooses to call**, rather than a fixed pipeline step. The model sees a tool description and decides per turn whether it needs to search, and what to search for.

What this buys:

- Conversational turns skip retrieval entirely — real cost and latency savings
- The model can **rewrite the query** before searching, so follow-ups work without you writing query-rewriting logic
- It can search **multiple times** with different queries if the first result is thin
- It can decide it already knows the answer

The trade: an extra LLM round-trip when a search *is* needed, and less predictable behaviour. For a strict latency SLA, a fixed chain is the safer choice.

> **In my own work.** This is exactly how Bubble works — one LLM node with `search_knowledge_base` bound as a tool, and `tools_condition` routing to either the tool or to END. Greetings never touch FAISS. The system prompt explicitly tells the model not to search for greetings or thanks.

### Self-RAG

Goes further: the model is trained to emit **reflection tokens** that critique its own process — *do I need to retrieve for this?*, *is this passage relevant?*, *is my output actually supported by it?* It can retrieve, judge the result poor, and retrieve again, all within one generation.

Agentic RAG puts the decision in the *orchestration*. Self-RAG puts it in the *model*. Agentic is what you build; Self-RAG requires a model trained for it.

---

## Query transformation

The user's question is often a bad search query. Four techniques worth naming:

**HyDE (Hypothetical Document Embeddings).** Ask the LLM to write a *hypothetical answer* to the question, embed that, and search with it. The intuition: in embedding space, a question and its answer aren't especially close — but a fake answer and a real answer are. Cost is one extra LLM call before retrieval.

**Query decomposition.** Break a compound question into sub-questions and retrieve for each. "How does our refund policy compare to our exchange policy?" is two retrievals, not one.

**Step-back prompting.** Ask a more general version first to retrieve broad context, then answer the specific question against it. "Was patient X's dosage within guidelines?" → step back to "what are the dosage guidelines for this drug?" → retrieve → then answer the specific case.

**Query expansion.** Generate several paraphrases, retrieve for all of them, fuse the ranked results (usually Reciprocal Rank Fusion). Improves recall at the cost of more searches.

**When to reach for these:** if `recall@k` is poor but the documents genuinely contain the answer, the query is the problem, not the index. That diagnosis is the answer interviewers want.

---

## Multi-hop questions

"Which doctor treated the patient who had the March procedure?" requires two retrievals **where the second depends on the first result**. Single-shot retrieval cannot do this — no single chunk contains the answer, and embedding the whole question retrieves things related to neither hop cleanly.

Three approaches:

1. **Decomposition** — split into sub-questions, retrieve sequentially, feed each answer into the next query. Works when the hops are predictable.
2. **Iterative agentic retrieval** — let the agent search, read, and search again based on what it found. More flexible, more expensive, needs a step cap.
3. **GraphRAG** — if the relationships are structural, traverse them rather than searching (below).

**How to detect the failure:** the system returns confident answers using only the first hop's information. Faithfulness scores look fine because the answer *is* grounded — just in the wrong half of the question.

---

## GraphRAG

**What it is.** Extract entities and their relationships from the corpus into a knowledge graph, then answer by traversing the graph — usually alongside vector search rather than replacing it.

**What it solves that vector search can't:**

- **Multi-hop** relational queries, where the connection between facts is the answer
- **Global / summarisation queries** — "what are the main themes across these 500 documents?" No single chunk contains that, so top-k retrieval structurally cannot answer it. Graph community detection can.
- Questions where **relationships matter more than passage similarity**

**The costs, which are substantial:** building the graph means an LLM pass over the entire corpus to extract entities and relations — expensive at scale. Keeping it fresh as documents change is harder than re-embedding a chunk. And extraction quality determines everything downstream.

**The honest answer:** "I'd reach for it when queries are relational or global rather than lookup-style, and I'd expect the construction cost and the freshness problem to be the hard parts."

---

## Per-user access control and multi-tenancy

**Expect this in any enterprise or healthcare interview.** It's where naive RAG designs fail an actual security review.

**The wrong approach:** retrieve top-k, then filter out documents the user can't see. This is broken in two ways — you leak information through timing and through the fact that fewer results come back, and if all top-k are filtered the user gets nothing while the system had the answer.

**The right approach — filter at query time:**

- Every chunk carries **permission metadata** (owner, team, patient ID, access tier) at index time
- The vector search is **pre-filtered** by the requesting user's scope, so it only ever searches over what they can see
- Most vector databases support metadata filtering natively; done well it's a pre-filter, not a post-filter

**For strong isolation** — different customers in a SaaS product, or different clinics — use **separate namespaces or indexes per tenant**. Slower to manage, but a bug can't leak across the boundary. In healthcare that's usually worth it.

**The trap to mention unprompted:** *permissions change*. If a document's access is revoked, the index must be updated or the old permissions persist forever. Any access-control design needs a reindex-on-permission-change path, not just on content change.

---

## Parent-child chunking

**The tension.** Small chunks embed and match precisely, because a single focused idea produces a clean vector. But small chunks give the LLM too little context to actually answer from.

**The technique.** Embed and search over **small child chunks**, but return the **larger parent** (the section, or the whole document) to the LLM. You get retrieval precision from the small unit and generation context from the large one.

Variants: sentence-window retrieval (match a sentence, return it plus n sentences either side), and auto-merging (if several children of the same parent are retrieved, return the parent instead).

> **In my own work.** The Jira agent does a version of this. `rag/chunker.py` builds `embed_text` from the file path plus the first 1500 characters — that's what goes into FAISS — but stores the **full file content** separately, because the planner needs the whole file to produce an exact string replacement. Decoupling *what you embed* from *what you retrieve* was the fix for edits that kept missing context.

---

## Quick reference

| Concept | One-line answer |
|---|---|
| Agentic RAG | Retrieval is a tool the model chooses to call, not a fixed step |
| Self-RAG | The model emits reflection tokens judging retrieval need and its own grounding |
| HyDE | Write a fake answer, embed *that*, search with it |
| Decomposition | Split compound questions into sub-questions, retrieve for each |
| Step-back | Retrieve the general rule first, then answer the specific case |
| Multi-hop | Second query depends on the first result; needs iteration or a graph |
| GraphRAG | Entity graph traversal; wins on relational and global-summary queries |
| Access control | Pre-filter by permission metadata at query time; never post-filter |
| Parent-child | Embed small for precision, return large for context |

---

Related: [[AI Agents]] · [[Embeddings and Vector Search]] · [[Evaluation]]
