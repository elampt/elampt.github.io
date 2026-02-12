# AI/Backend Career Learning Plan

**Target Roles (Priority Order):**
1. AI Application Engineer / GenAI Engineer
2. AI/ML Engineer
3. Python/FastAPI Backend Engineer
4. Solutions Engineer

**Timeline:** 12 Weeks
**Approach:** Project-Based Learning + DSA Practice

---

## Role Priority & Overlap Analysis

```
                    AI/ML Foundations    Python/FastAPI    Cloud/Deployment    Communication
─────────────────────────────────────────────────────────────────────────────────────────────
AI App Engineer         ████████████        ████████████       ██████████         ████████
AI/ML Engineer          ████████████████    ██████████         ████████           ██████
Python Backend          ████                ████████████████   ████████████       ████
Solutions Engineer      ██████              ████████████       ██████████         ████████████████
```

**Key Insight:** ~60% of skills overlap across all four roles. Learn once, apply everywhere.

---

## DevOps/Cloud Relevance

| Role | Relevance | What You Need |
|------|-----------|---------------|
| AI App Engineer | ⭐⭐⭐⭐ High | Docker, AWS (SageMaker, Lambda, Bedrock), basic K8s |
| AI/ML Engineer | ⭐⭐⭐⭐⭐ Very High | MLOps, model deployment, GPU instances, K8s for ML |
| Python Backend | ⭐⭐⭐ Medium | Docker, basic AWS (EC2, RDS, S3), CI/CD |
| Solutions Engineer | ⭐⭐ Low-Medium | Conceptual understanding, not hands-on |

**Recommendation:** Learn Docker + AWS basics (EC2, S3, Lambda) as foundation. Deep Kubernetes later if needed.

---

## Daily Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  Morning (1-2 hrs)    │  DSA: 1 Neetcode problem               │
│                       │  → Build habit, stay interview-ready   │
├───────────────────────┼─────────────────────────────────────────┤
│  Afternoon (2-3 hrs)  │  Learn: ONE concept deeply             │
│                       │  → Videos, docs, tutorials             │
├───────────────────────┼─────────────────────────────────────────┤
│  Evening (2-3 hrs)    │  Build: Apply to chatbot project       │
│                       │  → Hands-on implementation             │
└───────────────────────┴─────────────────────────────────────────┘

Weekly Total: 25-30 hours
```

---

## 12-Week Learning Plan

### Phase 1: AI Core (Weeks 1-4)
*Focus: Roles #1 and #2*

#### Week 1-2: LLM Fundamentals

| Day | DSA | Learn | Build |
|-----|-----|-------|-------|
| Mon | Arrays - Contains Duplicate | How LLMs work (transformers basics) | - |
| Tue | Arrays - Valid Anagram | Tokenization & embeddings | - |
| Wed | Arrays - Two Sum | Prompt engineering fundamentals | Test different prompts on chatbot |
| Thu | Arrays - Group Anagrams | Chain-of-thought, few-shot prompting | Improve chatbot system prompt |
| Fri | Arrays - Top K Frequent | LangChain intro - Chains | Start LangChain refactor |
| Sat | - | LangChain - Agents | Continue LangChain integration |
| Sun | - | Review & rest | Cleanup & commit |

**Resources:**
- [ ] Andrej Karpathy's "Let's build GPT" (YouTube)
- [ ] Jay Alammar's "The Illustrated Transformer"
- [ ] OpenAI Prompt Engineering Guide
- [ ] LangChain Documentation

#### Week 3-4: RAG & Vector Databases

| Topic | Learn | Build |
|-------|-------|-------|
| Chunking Strategies | Semantic vs fixed-size, overlap | Implement RecursiveCharacterTextSplitter |
| Embedding Models | OpenAI, Cohere, Sentence Transformers | Compare embedding quality |
| Retrieval Techniques | Similarity, MMR, hybrid search | Add BM25 + FAISS hybrid |
| Vector DBs | Pinecone vs Chroma vs Weaviate | Migrate to Chroma (or keep FAISS) |
| Evaluation | Retrieval accuracy metrics | Build eval pipeline |
| Citations | Confidence scores, source tracking | Add relevance scores to UI |

**Resources:**
- [ ] LangChain RAG tutorials
- [ ] Pinecone Learning Center
- [ ] "Building RAG Applications" - DeepLearning.AI

---

### Phase 2: Advanced AI + Backend (Weeks 5-8)
*Focus: Roles #1, #2, and #3*

#### Week 5-6: AI Agents & Tools

| Topic | Learn | Build |
|-------|-------|-------|
| ReAct Pattern | Agent reasoning loops | Simple ReAct agent |
| Function Calling | OpenAI/Anthropic function calling | Add tool use to chatbot |
| LangGraph | Multi-step agent workflows | Complex agent pipeline |
| MCP | Model Context Protocol | MCP server basics |
| Multi-Agent | Agent communication patterns | Two-agent system |

**Resources:**
- [ ] LangGraph Documentation
- [ ] Anthropic MCP Documentation
- [ ] "Building AI Agents" - Harrison Chase tutorials

#### Week 7-8: FastAPI Production Patterns

| Topic | Learn | Build |
|-------|-------|-------|
| Async Python | async/await deep dive | Async endpoints |
| FastAPI Advanced | Dependency injection, middleware | Refactor chatbot backend |
| Authentication | OAuth2, JWT tokens | Add auth to API |
| Database | SQLAlchemy async, Alembic | Add conversation storage |
| Caching | Redis basics | Cache embeddings/responses |
| Testing | pytest, async testing | Test suite for API |

**Resources:**
- [ ] FastAPI Official Documentation
- [ ] TestDriven.io FastAPI tutorials
- [ ] ArjanCodes YouTube (Python best practices)

---

### Phase 3: Deployment & Polish (Weeks 9-12)
*Focus: All 4 roles*

#### Week 9-10: Cloud & Deployment

| Topic | Learn | Build |
|-------|-------|-------|
| Docker | Containers, Dockerfile, multi-stage | Dockerize chatbot |
| Docker Compose | Multi-container apps | Redis + API + UI setup |
| AWS EC2 | Instance setup, security groups | Deploy chatbot |
| AWS S3 | Object storage | Store embeddings/files |
| AWS Lambda | Serverless functions | Serverless endpoint (optional) |
| AWS Bedrock | Managed LLMs | Switch to Bedrock (optional) |

**Resources:**
- [ ] Docker Official Tutorial
- [ ] AWS Skill Builder (free)
- [ ] FreeCodeCamp AWS Course

#### Week 11-12: Solutions Skills & Portfolio

| Topic | Learn | Build |
|-------|-------|-------|
| API Design | OpenAPI, versioning, documentation | Polish API docs |
| Technical Writing | Documentation best practices | README, blog post |
| Demo Skills | Presentation, storytelling | Record demo video |
| Troubleshooting | 5 Whys, systematic debugging | Document debugging process |
| Portfolio | GitHub profile optimization | Clean all repos |

**Deliverables:**
- [ ] 2-3 polished GitHub projects
- [ ] Updated LinkedIn with projects
- [ ] Blog post about RAG learnings
- [ ] Demo video of chatbot

---

## DSA Track: Neetcode 150

**Strategy:** 1 problem/day, pattern-based approach

### Schedule

| Weeks | Pattern | Problems | Count |
|-------|---------|----------|-------|
| 1-2 | Arrays & Hashing | Contains Duplicate, Valid Anagram, Two Sum, Group Anagrams, Top K Frequent, etc. | 9 |
| 3-4 | Two Pointers + Sliding Window | Valid Palindrome, 3Sum, Container with Water, Best Time to Buy Stock, etc. | 7 |
| 5-6 | Stack + Binary Search | Valid Parentheses, Min Stack, Binary Search, Search Rotated Array, etc. | 11 |
| 7-8 | Linked List + Trees | Reverse LL, Merge Two LL, Invert Tree, Max Depth, Same Tree, etc. | 18 |
| 9-10 | Tries + Heap/Priority Queue | Implement Trie, Word Search, Kth Largest, Task Scheduler, etc. | 9 |
| 11-12 | Graphs + DP Basics | Number of Islands, Clone Graph, Climbing Stairs, House Robber, etc. | 15 |

**Tools:**
- [Neetcode.io](https://neetcode.io) - Organized problem list with video explanations
- LeetCode - Practice platform
- Language: Python (aligns with AI/Backend focus)

**Rules:**
1. Time-box: 30 mins max per problem
2. If stuck after 20 mins, look at hints
3. If stuck after 30 mins, study the solution
4. Always understand the pattern, not just the solution
5. Review failed problems on weekends

---

## Chatbot Upgrade Roadmap

### Current State
- [x] FAISS vector search
- [x] Sentence Transformers embeddings
- [x] Groq API for LLM
- [x] Streamlit UI
- [x] Basic chunking

### Level 1: Quick Wins
- [ ] Semantic chunking with overlap
- [ ] Chat memory (conversation history)
- [ ] Hybrid search (BM25 + vector)

### Level 2: Production Features
- [ ] FastAPI backend (separate from UI)
- [ ] Evaluation pipeline with metrics
- [ ] Citation confidence scores
- [ ] Rate limiting & caching

### Level 3: Advanced
- [ ] LangChain/LangGraph migration
- [ ] Multi-source RAG (PDF, web, etc.)
- [ ] Docker deployment
- [ ] AWS hosting

---

## Resources Master List

### LLM/AI
| Resource | Type | Link |
|----------|------|------|
| DeepLearning.AI Short Courses | Course | https://www.deeplearning.ai/short-courses/ |
| LangChain Academy | Course | https://academy.langchain.com/ |
| Hugging Face NLP Course | Course | https://huggingface.co/learn/nlp-course |
| Andrej Karpathy YouTube | Videos | https://www.youtube.com/@AndrejKarpathy |
| LangChain Docs | Docs | https://python.langchain.com/docs/ |

### Python/FastAPI
| Resource | Type | Link |
|----------|------|------|
| FastAPI Documentation | Docs | https://fastapi.tiangolo.com/ |
| TestDriven.io | Tutorials | https://testdriven.io/blog/topics/fastapi/ |
| ArjanCodes | YouTube | https://www.youtube.com/@ArjanCodes |
| Real Python | Articles | https://realpython.com/ |

### Cloud/DevOps
| Resource | Type | Link |
|----------|------|------|
| AWS Skill Builder | Course | https://skillbuilder.aws/ |
| Docker Tutorial | Docs | https://docs.docker.com/get-started/ |
| FreeCodeCamp AWS | YouTube | https://www.youtube.com/freecodecamp |

### DSA
| Resource | Type | Link |
|----------|------|------|
| Neetcode.io | Problems | https://neetcode.io/ |
| LeetCode | Practice | https://leetcode.com/ |
| NeetCode YouTube | Videos | https://www.youtube.com/@NeetCode |

---

## Weekly Checklist Template

```markdown
## Week [X] - [Date Range]

### Goals
- [ ] Main learning goal
- [ ] Main building goal
- [ ] DSA problems (5-6)

### DSA Progress
- [ ] Mon: Problem name
- [ ] Tue: Problem name
- [ ] Wed: Problem name
- [ ] Thu: Problem name
- [ ] Fri: Problem name

### Learning Completed
- [ ] Topic 1
- [ ] Topic 2

### Built/Implemented
- [ ] Feature 1
- [ ] Feature 2

### Blockers/Notes
-

### Next Week Preview
-
```

---

## Interview Talking Points

After completing this plan, you'll be able to say:

> "I built a RAG chatbot and iteratively improved it:
> - Started with basic FAISS and chunking
> - Added semantic chunking, improving retrieval accuracy by X%
> - Implemented hybrid search for edge cases
> - Built a FastAPI backend with auth and rate limiting
> - Deployed on AWS with Docker
> - Created an evaluation pipeline to measure quality"

This demonstrates: **growth mindset, practical engineering, production thinking, and measurable impact**.

---

## Progress Tracker

| Week | Phase | Status | Notes |
|------|-------|--------|-------|
| 1 | LLM Fundamentals | ⬜ Not Started | |
| 2 | LLM Fundamentals | ⬜ Not Started | |
| 3 | RAG & Vector DBs | ⬜ Not Started | |
| 4 | RAG & Vector DBs | ⬜ Not Started | |
| 5 | AI Agents | ⬜ Not Started | |
| 6 | AI Agents | ⬜ Not Started | |
| 7 | FastAPI | ⬜ Not Started | |
| 8 | FastAPI | ⬜ Not Started | |
| 9 | Deployment | ⬜ Not Started | |
| 10 | Deployment | ⬜ Not Started | |
| 11 | Polish | ⬜ Not Started | |
| 12 | Polish | ⬜ Not Started | |

---

*Last Updated: February 2026*
*Created with Claude Code*
