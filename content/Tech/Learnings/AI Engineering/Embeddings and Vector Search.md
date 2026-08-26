---
title: Embeddings and Vector Search — Interview Notes
date: 2026-08-26
tags: [ai, embeddings, vector-database, faiss, interview-prep]
---

# Embeddings and Vector Search

> Index types (flat, IVFPQ, HNSW) are covered in the round-2 notes. This is the rest of it — dimensionality, storage cost, and the production question that actually catches people out: what happens when you change the embedding model.

---

## Embedding dimensionality

**What it is.** The length of the vector each piece of text becomes. `all-MiniLM-L6-v2` produces 384 dimensions; OpenAI's `text-embedding-3-small` produces 1536; `3-large` produces 3072.

**The trade-off is linear in three places:**

- **Storage** — 1536-dim float32 vectors are 4× the memory of 384-dim. A million vectors at 1536 dims is ~6 GB before any index overhead.
- **Search time** — every distance computation scales with dimension.
- **Quality** — more dimensions capture more nuance, but with **strongly diminishing returns**. For most single-domain corpora, 384 or 768 is close to as good as 1536.

**How to choose:** benchmark on *your* data with *your* queries. MTEB leaderboards are a starting shortlist, not an answer — a model that tops a general benchmark can underperform on clinical or legal text where vocabulary is specialised.

Three practical factors beyond the score: can it run locally on CPU (matters for cost and for PHI that can't leave your infrastructure), what's its max input length (many cap at 512 tokens, which constrains chunk size), and is it multilingual if you need that.

> **In my own work.** Bubble uses 384-dim MiniLM deliberately. The corpus is 82 chunks — dimension isn't the bottleneck, and CPU-friendly matters more because it runs on a small instance with no GPU.

**Matryoshka embeddings** are worth knowing: trained so that the *prefix* of the vector is itself a valid embedding. You can truncate 1536 dims to 256 and keep most of the quality, which lets you store short vectors for the first-pass search and full ones for re-scoring.

---

## Embedding quantization

Same idea as [[LLM Internals|weight quantization]], applied to stored vectors.

| Precision | Size vs float32 | Quality |
|---|---|---|
| float32 | 1× | baseline |
| int8 | 4× smaller | near-lossless with rescoring |
| binary (1 bit/dim) | **32× smaller** | surprisingly usable with rescoring |

**The rescoring pattern** is what makes aggressive quantization viable: search over the quantized vectors to get a wide candidate set fast and cheap, then re-rank those candidates using the full-precision vectors (or a cross-encoder). Recall comes from the cheap pass, precision from the expensive one applied to a small set.

That's structurally the same argument as bi-encoder → cross-encoder reranking: **do the cheap thing broadly, the expensive thing narrowly.** Being able to point out that it's the same pattern twice is a good interview moment.

---

## Sparse vs dense embeddings

**Dense** — a few hundred to a few thousand dimensions, nearly all non-zero, learned by a neural model. Captures semantic similarity: "car" and "automobile" land close together.

**Sparse** — vocabulary-sized (tens of thousands of dimensions), almost all zero, each dimension corresponding to a term. TF-IDF and BM25 produce these. Captures exact lexical match.

**Why you often need both.** Dense retrieval fails on exact tokens an embedding model never learned meaningfully — product codes, drug names, ICD codes, error strings, version numbers. `CPT 99213` has no useful vector. BM25 matches it exactly. Conversely, BM25 scores near zero for "how do I reset my password" against "forgot login credentials", which share no terms.

**Hybrid search** runs both and fuses the rankings, usually with **Reciprocal Rank Fusion** — score each document as the sum of `1/(k + rank)` across the two result lists, which combines rankings without needing the two scores to be on a comparable scale. This is the standard production answer in 2026.

**Learned sparse** (SPLADE and similar) sits in between — a neural model producing sparse vocabulary-space vectors with term expansion, giving you exact matching plus some semantic generalisation.

---

## Embedding drift and changing models in production

**This is the highest-value question in this note.** It appears in the source repo three different ways, and the underlying fact catches people out.

**The fact: vectors from two different models are not comparable.** They live in entirely different spaces. You cannot mix them in one index, and you cannot query a new-model embedding against an old-model index — you'll get results that are numerically valid and semantically meaningless.

So changing the embedding model means **re-embedding the whole corpus**. There is no incremental path.

**How to do it safely — blue-green:**

1. Build the **new index alongside the old**, leaving the old one serving traffic
2. Evaluate both on a **golden query set** with `recall@k` — don't assume the newer model is better on *your* data
3. **Swap atomically** once satisfied
4. Keep the old index around long enough to roll back

**If the dimensions differ**, you also have a schema change — the vector column or index definition has to change, which usually means a new collection rather than an in-place migration.

**The classic incident:** *"we deployed a new embedding model and search quality crashed overnight."* Almost always a **partially migrated index** — some vectors from the old model, some from the new, all being compared against each other. Symptom: results are not just worse but nonsensical, and the badness correlates with which documents were reindexed.

**True drift, as distinct from a model swap:** the *data* changes rather than the model. New jargon, new product names, a shifted query distribution. The embedding model doesn't know terms coined after its training cutoff. Detection needs a fixed eval set run on a schedule — if you can't see it, you can't diagnose it. The fix is usually fine-tuning the embedding model on domain data, or adding a sparse component to catch the exact terms.

---

## Metadata and multi-tenancy

Vectors alone are rarely enough. Every chunk should carry metadata: source document, section, date, and permission scope.

**What metadata buys you:**

- **Pre-filtering** — "only search documents from this clinic, in the last two years, that this user can see." Done as a pre-filter it narrows the search space; done as a post-filter it's both slower and a security hole (see [[RAG Advanced]] on access control).
- **Citations** — you can't attribute an answer to a source you didn't store a pointer to.
- **Freshness** — dating chunks lets you prefer recent information or expire stale ones.
- **Deletion** — you need a stable document ID to remove or update a document's vectors. Without it, deleted documents keep being retrieved forever.

**For strong tenant isolation**, separate namespaces or indexes per tenant beat metadata filtering. More to manage, but a filtering bug can't leak across the boundary.

---

## Quick reference

| Concept | One-line answer |
|---|---|
| Dimensionality | Linear cost in storage and search; strongly diminishing quality returns |
| Matryoshka | Prefix of the vector is a valid shorter embedding — truncate freely |
| Embedding quantization | int8 ≈ 4× smaller near-lossless; binary 32× smaller with rescoring |
| Rescoring | Cheap wide search, expensive narrow re-rank — same pattern as cross-encoder |
| Sparse vs dense | Sparse = exact terms; dense = meaning; hybrid + RRF for both |
| Changing model | Vectors aren't comparable across models — full re-embed, blue-green swap |
| Quality crash overnight | Almost always a partially migrated index |
| Metadata | Enables pre-filtering, citations, freshness, and deletion |

---

Related: [[RAG Advanced]] · [[LLM Internals]] · [[Evaluation]]
