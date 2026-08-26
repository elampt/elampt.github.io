---
title: LLM Internals — Interview Notes
date: 2026-08-26
tags: [ai, llm, transformers, interview-prep]
---

# LLM Internals

> The mechanical questions that come up once an interviewer moves past "what is RAG". Each section ends with the follow-ups that usually arrive next.

---

## Quantization

**What it is.** Reducing the numeric precision used to store model weights. Training happens in 16-bit float by default. Quantizing to int8 halves memory; int4 quarters it.

**Why it matters.** A 70B-parameter model at fp16 needs roughly 140 GB just for weights — several GPUs. At int4 it's around 35 GB and fits on one. That's the difference between "we need a cluster" and "we can self-host this."

**The two kinds:**

- **Post-training quantization (PTQ)** — take an already-trained model and convert the weights. Cheap, no retraining, done in minutes. This is what GGUF, AWQ and GPTQ produce.
- **Quantization-aware training (QAT)** — simulate low precision *during* training so the model learns to be robust to it. Better quality, but you need the training pipeline and the compute.

**The trade.** Accuracy drops. It's small on straightforward tasks and noticeably worse on multi-step reasoning and long-context work, because small errors compound across steps. int8 is usually near-lossless; int4 is where you start to feel it.

### Don't confuse the three compression techniques

| Technique | What changes | Needs a second model? |
|---|---|---|
| **Quantization** | The *precision* of the numbers | No |
| **Pruning** | Removes weights entirely (sets them to zero) | No |
| **Distillation** | Trains a *smaller* model to imitate a bigger one | Yes — teacher and student |

All three cut serving cost. Only distillation involves training a new model, and only distillation changes the architecture.

**Follow-ups to expect:** "Would you quantize in production?" — yes for self-hosted serving where memory is the constraint, and I'd validate on my own eval set rather than trusting published benchmarks, because degradation is task-specific. "What about quantizing embeddings?" — different thing, see [[Embeddings and Vector Search]].

---

## KV cache, and why the first token is slow

Generation happens in two distinct phases, and conflating them is the source of most confusion about LLM latency.

**Prefill.** The model processes your entire prompt in one parallel forward pass, computing attention across all input tokens at once. This is compute-heavy and scales with prompt length. **Time-to-first-token is essentially prefill time.**

**Decode.** The model then emits one token at a time, each pass appending a single token. This is memory-bandwidth-bound rather than compute-bound, and it's why tokens after the first arrive in a steady stream.

**Where the cache comes in.** Naively, generating token 500 would re-compute attention keys and values for all 499 previous tokens — quadratic work repeated on every step. The **KV cache** stores the key and value vectors for every token already processed. Each new token computes only its own query and attends against the cached keys and values. That turns per-token generation from quadratic into linear.

**The cost is memory.** Cache size grows with `batch × sequence_length × num_layers × hidden_dim`. For long conversations or large batches it becomes the binding constraint on how many concurrent requests a GPU can serve — often before compute does.

**How the cache gets managed:**

- **Grouped-Query Attention (GQA)** — multiple query heads share one set of key/value heads, shrinking the cache several-fold with little quality loss. This is why nearly every modern open model uses GQA instead of plain multi-head attention.
- **PagedAttention** (vLLM) — allocate the cache in fixed-size pages like virtual memory rather than one contiguous block, which removes fragmentation waste.
- **Sliding window / eviction** — drop the oldest entries once past a threshold, accepting that the model forgets the far past.

> **In my own work.** This directly explains the voice-agent latency budget: time-to-first-token *is* prefill, which is why a bloated system prompt is a latency bug rather than just a cost one. Same reason streaming TTS on the first sentence matters — it takes full-response generation off the critical path.

**Follow-ups:** "Why is the first token slower?" — prefill processes the whole prompt; decode processes one token. "How do you reduce TTFT?" — shorter prompts, prompt caching for a stable prefix, a smaller model for easy turns.

---

## Why context windows are limited

Three separate reasons, and a good answer names more than one.

1. **Attention is O(n²).** Every token attends to every other token, so doubling the context quadruples the attention computation. This is the headline reason.
2. **The KV cache grows linearly** with context length and eats GPU memory that would otherwise serve other requests. At scale this often binds before compute does.
3. **Quality degrades before the limit.** Models are trained at a certain sequence length. Beyond it, positional generalisation weakens and retrieval accuracy within the context drops — the "lost in the middle" effect. A model advertising 1M tokens does not use all of them equally well.

**What's being done about it:** Flash Attention (an IO-aware exact-attention implementation that avoids materialising the full n×n matrix, so it's faster and far more memory-efficient without changing results), sparse and sliding-window attention (each token attends to a subset), and RoPE scaling tricks to extend a trained window.

**Follow-up:** "So should I just use a huge context instead of RAG?" — no. Cost scales with tokens sent on every call, latency scales with prefill, and retrieval accuracy inside a giant context is worse than targeted retrieval. Big context complements RAG; it doesn't replace it.

---

## Temperature, top-k and top-p

The model's final layer produces **logits** — one raw, unbounded score per vocabulary token. Softmax turns them into a probability distribution. Sampling strategy decides which token you actually pick.

**Temperature** divides the logits before the softmax:

- `T < 1` sharpens the distribution — high-probability tokens get relatively higher, output becomes more deterministic
- `T > 1` flattens it — more diversity, more risk of nonsense
- `T = 0` is effectively greedy decoding: always take the argmax

**Top-k** restricts sampling to the k highest-probability tokens. Simple, but rigid: k=50 is far too many when the model is highly confident and possibly too few when it's genuinely uncertain.

**Top-p (nucleus)** restricts sampling to the smallest set of tokens whose cumulative probability exceeds p. It's **adaptive** — when the model is confident the nucleus might hold 3 tokens; when it's uncertain it might hold 40. That adaptivity is why top-p is generally preferred over top-k.

**Practical settings.** For factual Q&A or extraction: temperature 0–0.3. Top-p barely matters there because the distribution is already sharp. For creative writing: temperature 0.7–1.0 with top-p around 0.9.

**Follow-up you should have an opinion on:** "You set temperature to 0 — is the output deterministic?" Not quite. Floating-point non-associativity in batched GPU kernels means the same prompt can produce different results across runs. Close to deterministic, not guaranteed.

---

## Positional encoding and RoPE

**The problem.** Self-attention is permutation-invariant — it computes relationships between tokens with no inherent notion of order. Without positional information, "dog bites man" and "man bites dog" produce identical representations.

**The original solution.** Add fixed sinusoidal vectors to the token embeddings before the first layer, so each position gets a distinctive signature. Works, but the position information is *absolute* and it has to survive being added to the semantic embedding.

**RoPE (Rotary Position Embedding)** takes a different approach: instead of adding anything to the embeddings, it **rotates** the query and key vectors by an angle proportional to their position. Because the attention score is a dot product between a rotated query and a rotated key, the result depends only on the **difference** between their positions — relative position falls out of the maths for free.

**Why it won:**

- Relative position generalises better to sequences longer than those seen in training
- No extra parameters to learn
- It's what makes context-extension tricks (position interpolation, NTK-aware scaling) possible — you scale the rotation frequencies rather than retraining

Used by LLaMA, Mistral, Qwen and most modern open-weight models.

---

## Mixture of Experts (MoE)

**The idea.** Replace the single feed-forward network in each transformer layer with many smaller "expert" networks plus a **router** that sends each token to only a few of them — typically the top 2.

**Why it's valuable.** You decouple *capacity* from *inference cost*. A model might have 47B total parameters but activate only ~13B for any given token. You get the knowledge capacity of a large model at roughly the compute cost of a small one.

**The costs, which are real:**

- **All experts must be in memory** even though most are idle for any given token. MoE saves compute, not VRAM.
- **Load balancing is a genuine training problem.** Left alone, the router collapses onto a few favourite experts and the rest never learn. Auxiliary load-balancing losses exist specifically to prevent this.
- Fine-tuning MoE models is fiddlier than dense ones.

**Dense vs sparse.** A *dense* model uses every parameter for every token. A *sparse* model (MoE) activates a subset. Mixtral and DeepSeek are the well-known open examples.

**Follow-up:** "When would you not use MoE?" — when memory is the constraint rather than compute, which is the common case for self-hosting on limited hardware.

---

## Quick reference

| Concept | One-line answer |
|---|---|
| Quantization | Lower-precision weights; PTQ is cheap, QAT is better; int8 near-lossless, int4 hurts reasoning |
| KV cache | Stores past keys/values so each new token is linear, not quadratic; memory is the cost |
| Prefill vs decode | Prefill = whole prompt in parallel = TTFT; decode = one token at a time |
| Context limit | O(n²) attention + linear cache growth + quality decay past training length |
| Temperature | Scales logits before softmax; lower = sharper = more deterministic |
| Top-p vs top-k | Top-p adapts its candidate set to model confidence; top-k is a fixed count |
| RoPE | Rotates Q and K by position so attention depends on *relative* distance |
| MoE | Many experts, route to a few; large capacity at small compute, but full memory cost |

---

Related: [[Fine-Tuning and Alignment]] · [[Embeddings and Vector Search]] · [[AI Agents]]
