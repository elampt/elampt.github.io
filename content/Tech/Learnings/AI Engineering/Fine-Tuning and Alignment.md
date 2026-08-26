---
title: Fine-Tuning and Alignment — Interview Notes
date: 2026-08-26
tags: [ai, llm, fine-tuning, rlhf, interview-prep]
---

# Fine-Tuning and Alignment

> "Fine-tuning" is on almost every AI-engineering JD and in the source repo's Must Know list. The interview value is less in knowing how to run a training job and more in knowing **when not to**.

---

## The decision that comes first

Before any fine-tuning discussion, answer two questions: **is the gap knowledge or behaviour?** and **how often does it change?**

| Approach | Use when | Cost | Weakness |
|---|---|---|---|
| **Prompt engineering** | Behaviour change, format control, a handful of examples is enough | Near zero | Bounded by context window; brittle across model versions |
| **RAG** | The model lacks *knowledge*, especially private or fast-changing knowledge | Low–medium | Latency; only as good as retrieval; needs a data pipeline |
| **Fine-tuning** | Consistent *style, format or domain behaviour* prompting won't produce; or distilling into a smaller, cheaper model | High — data, training, eval, and retraining as things drift | Doesn't reliably add facts; expensive to keep current |

**The line to say: "fine-tuning teaches behaviour, RAG supplies knowledge."**

Wanting the model to know your Q3 policy document is a retrieval problem — fine-tuning facts in is unreliable and every update means retraining. Wanting it to always produce clinical documentation in your house format is a fine-tuning problem, because that's a behaviour you want baked in rather than re-explained in every prompt.

Order of escalation: prompt first, add RAG, fine-tune only when you have evidence the first two aren't enough. Most teams reach for fine-tuning far too early.

**A third, underrated reason to fine-tune:** cost and latency. If a big model already does the task well, fine-tuning a small one on its outputs can get you 90% of the quality at a fraction of the serving cost. That's distillation in practice.

---

## Full fine-tuning vs LoRA vs QLoRA

### Full fine-tuning

Update every weight in the model. The memory cost is the problem: you need the weights, the gradients, and the optimizer states (Adam keeps two additional values per parameter). Rule of thumb is **12–16× the model size in GPU memory**. A 7B model needs ~100 GB; a 70B model is out of reach for most teams.

You also get **catastrophic forgetting** — training hard on a narrow dataset degrades general capability the model previously had.

### LoRA (Low-Rank Adaptation)

**The insight:** the *update* you want to make to a weight matrix during fine-tuning is low-rank — it doesn't need the full expressive capacity of the original matrix.

**The mechanism:** freeze the original weights entirely. Alongside each target matrix, inject two small matrices `A` (d × r) and `B` (r × d) where the rank `r` is small — typically 8 to 64. Train only `A` and `B`. At inference, the effective weight is `W + BA`.

**What this buys:**

- You train roughly **0.1–1% of the parameters**. Memory drops by an order of magnitude because there are no optimizer states for the frozen weights.
- The adapter is **a few megabytes**. One base model in memory can serve many fine-tunes by swapping adapters — enormously cheaper than hosting N full models.
- The base model is untouched, so catastrophic forgetting is much reduced.

**Key hyperparameter:** rank `r`. Higher rank means more capacity and more parameters. Small `r` (8–16) is usually enough for style and format adaptation; larger for genuinely new capability.

### QLoRA

LoRA plus quantizing the **frozen base model to 4-bit**. The adapters still train in higher precision, so quality holds up. This is what makes fine-tuning a 70B model on a single consumer GPU feasible.

**PEFT** (Parameter-Efficient Fine-Tuning) is the umbrella term — LoRA is the dominant member, alongside prefix tuning, prompt tuning and adapters.

**Follow-up:** "When would you do full fine-tuning instead?" — when you're genuinely teaching a new domain or language rather than adjusting behaviour, and you have both the data and the compute. It's rare in application engineering.

---

## Alignment: RLHF and DPO

Base models trained on next-token prediction are good at continuing text and bad at being useful assistants. Alignment is the step that fixes that.

### RLHF (Reinforcement Learning from Human Feedback)

Three stages:

1. **Supervised fine-tuning (SFT)** — train on high-quality demonstration data so the model learns the assistant format at all.
2. **Reward model** — show humans pairs of outputs and record which they prefer. Train a separate model to predict those preferences, producing a scalar "how good is this response" score.
3. **RL optimisation** — optimise the LLM against the reward model using PPO (Proximal Policy Optimization), with a KL-divergence penalty that keeps it from drifting too far from the SFT model.

**Why PPO specifically:** "proximal" refers to constraining how far the policy can move in a single update. Unconstrained RL on a language model diverges into gibberish quickly.

**The two failure modes worth naming:**

- **Reward hacking** — the model finds outputs the reward model scores highly that humans don't actually like. Classic symptoms: excessive hedging, needless length, sycophancy. The reward model is a proxy, and optimising hard against a proxy breaks it.
- **Alignment tax** — the model becomes safer and better-behaved but loses capability on hard tasks. Mitigations: mix capability data back into the alignment stage, and evaluate on capability benchmarks alongside safety ones rather than only measuring what you're optimising.

### DPO (Direct Preference Optimization)

**The insight:** you don't need the reward model at all. There's a closed-form relationship between the optimal RL policy and the preference data, which means you can optimise directly on preference pairs with a simple classification-style loss.

**What you get:** no separate reward model to train and host, no RL loop, far more stable training, and comparable results. It's why most open models released since 2024 use DPO or a variant (IPO, KTO, ORPO).

**What you lose:** less ability to do online exploration — RLHF can generate new samples and score them, DPO works from a fixed preference dataset.

**GRPO (Group Relative Policy Optimization)** is the more recent variant used heavily for reasoning models: sample a *group* of responses per prompt and compute advantage relative to the group average, removing the need for a separate value network.

---

## Quick reference

| Concept | One-line answer |
|---|---|
| Fine-tune vs RAG | Fine-tuning teaches behaviour; RAG supplies knowledge |
| Full fine-tuning | Update all weights; 12–16× model size in memory; catastrophic forgetting |
| LoRA | Freeze base, train small low-rank matrices; ~1% of params, MB-sized swappable adapters |
| QLoRA | LoRA with a 4-bit quantized frozen base; 70B on one GPU |
| RLHF | SFT → reward model → PPO; powerful, unstable, prone to reward hacking |
| DPO | Skip the reward model, optimise preferences directly; simpler and stable |
| Reward hacking | Model games the reward proxy — hedging, verbosity, sycophancy |
| Alignment tax | Safety gains bought with capability loss; measure both |

---

Related: [[LLM Internals]] · [[RAG Advanced]] · [[Evaluation]]
