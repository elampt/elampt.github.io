---
title: AI Engineering
date: 2026-08-26
tags: [ai, llm, interview-prep]
---

# AI Engineering — Interview Notes

Concept write-ups for AI-engineering interviews, worked from the question list in [amitshekhariitbhu/ai-engineering-interview-questions](https://github.com/amitshekhariitbhu/ai-engineering-interview-questions). The questions are theirs; the answers here are mine, written out rather than linked.

These cover the concepts that get asked and that I couldn't already answer cold. Where a concept maps to something I actually built — [Bubble](https://github.com/elampt/elam-chatbot) or the Jira coding agent — there's a callout saying what I did and why, because that's the version of the answer that holds up when an interviewer probes.

---

## The notes

| Note | Covers |
|---|---|
| [[LLM Internals]] | Quantization · KV cache, prefill vs decode, why the first token is slow · why context windows are limited · temperature, top-k, top-p · positional encoding and RoPE · Mixture of Experts |
| [[Fine-Tuning and Alignment]] | Fine-tune vs RAG vs prompt · full fine-tuning vs LoRA vs QLoRA · RLHF, PPO, reward hacking, alignment tax · DPO and GRPO |
| [[RAG Advanced]] | Naive vs agentic vs Self-RAG · HyDE, decomposition, step-back · multi-hop · GraphRAG · per-user access control · parent-child chunking |
| [[AI Agents]] | MCP · ReAct vs Plan-and-Execute · how tool calling actually works · agent memory and eviction · prompt injection and agent security · loop termination |
| [[Embeddings and Vector Search]] | Dimensionality and cost · embedding quantization and Matryoshka · sparse vs dense and hybrid search · changing the embedding model in production · metadata and multi-tenancy |
| [[Evaluation]] | LLM-as-judge and its four biases · deterministic checks · offline vs online · golden datasets · red teaming · reading benchmarks |

---

## Suggested reading order

1. **[[LLM Internals]]** — everything else assumes it. KV cache and prefill/decode in particular explain latency questions across the rest.
2. **[[RAG Advanced]]** and **[[Embeddings and Vector Search]]** — read as a pair; they're two halves of the same system.
3. **[[AI Agents]]** — the section with the most of my own project evidence.
4. **[[Evaluation]]** — the identified weak spot, so worth more than one pass.
5. **[[Fine-Tuning and Alignment]]** — least likely to come up for an applied engineering role, but "fine-tune or RAG?" is asked constantly.

---

## Already covered elsewhere

Not repeated here — these live in the round-2 prep material: self-attention, HNSW vs IVFPQ, distillation, chunking strategies, bi-encoder vs cross-encoder reranking, faithfulness and context recall, lost-in-the-middle, RAG debugging, document freshness, human-in-the-loop, precision/recall and threshold selection, MLOps, voice agent architecture.

Adjacent notes from actual deployments: [[AWS]] · [[Docker]]

---

## How to use these

Reading these is not the same as being able to answer. The failure mode is real and I've hit it — reading an explanation eight hours before an interview and still drawing a blank on the question.

So: for each concept, try to say the answer out loud **first**, then read. The gap between what you produced and what's written is the only part worth studying.
