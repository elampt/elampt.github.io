---
title: Portfolio
description: "Elambharathi Thangavel — Python Engineer building AI agents and LLM applications."
cssclasses:
  - portfolio
---

# Elambharathi Thangavel

**Python Engineer · AI/LLM Applications** · Bengaluru, India

[Resume (PDF)](./resume.pdf) · [GitHub](https://github.com/elampt) · [LinkedIn](https://www.linkedin.com/in/elambharathithangavel/) · [Email](mailto:elambharathi.pt@gmail.com) · +91 9677407190

---

## About

Python Engineer building production-grade AI agents and LLM applications with LangGraph, RAG, and MCP. Built an autonomous Jira-to-PR coding agent with self-healing test loops, Playwright visual verification via MCP, and human-in-the-loop approval — with full LangFuse observability. Also built an agentic RAG chatbot with two-stage retrieval and config-driven architecture. Won PhonePe's AI Immersion Hackathon. Backed by production experience — automation pipelines on HDFS, on-call across 6 microservices, and FastAPI backends with PostgreSQL.

---

## Experience

### Product Solution Engineer · [PhonePe](https://www.phonepe.com/)
*Bengaluru · Jul 2025 – Present*
*India's leading digital payments platform — Quick-Commerce division (Pincode)*

- **Won the PhonePe "AI Immersion Hackathon"** — built a complete end-to-end appointment booking system (merchant-facing: salons, spas, etc.) in 5 days using AI-assisted development. Led architecture design, API contract definition, and backend integration; judged on production-readiness and code quality.
- Built an **end-to-end automation pipeline** (Python + PySpark + Hive) replacing a paid third-party platform — extracts merchant data from HDFS, applies business logic, and creates tasks via internal REST APIs. Runs **twice daily via cron** with 99%+ uptime and zero manual intervention.
- Provided **L1/L2 on-call support across 6 distributed microservices** (Catalogue, Transaction, Fulfillment, Search, Buyer/Seller Apps). Achieved best-in-team metrics: **MTTA < 1hr, MTTR < 13hrs** through systematic log analysis and cross-service debugging.
- Served as **primary technical POC for merchant API integrations** (Order, Inventory, Catalog APIs) — led end-to-end lifecycle from consultation to production sign-off with **100% success rate**. Debugged API request/response flows using Postman and log analysis tools.
- Built an **automated reporting pipeline**: Google Sheets API → HTML templating → PDF generation → SMTP email delivery, eliminating daily manual reporting work.

### Python Developer · Chatbot Engineer · [Jobshine](https://jobshine.sg/)
*Singapore (Hybrid) · May 2024 – May 2025*
*Singapore-based startup — blue-collar recruitment automation*

- Built and maintained **AI chatbots across WhatsApp, Messenger, and Telegram** using Python and Make (Integromat); automated candidate engagement workflows and job application pipelines for messaging platforms.
- Developed **in-house Python web crawlers** (Selenium, BeautifulSoup, Requests) replacing a paid scraping tool, saving **100% in tool costs** and reducing manual data collection by **70%**.
- Performed **EDA on engagement data** using Pandas to improve lead quality and recruitment conversion outcomes.

---

## Featured Projects

### Jira Coding Agent — AI-Powered Code Automation
*Apr 2026 · [GitHub](https://github.com/elampt/jira-coding-agent)*

Built an **autonomous AI coding agent** using LangGraph that watches Jira for tickets, modifies a React codebase via RAG-powered code search (FAISS + grep), runs tests with a **self-healing retry loop**, and creates PRs with **before/after screenshots via Playwright MCP**. Includes human-in-the-loop approval for high-risk changes and full LLM observability via LangFuse.

**Tech:** Python, LangGraph, FAISS, Playwright MCP, LangFuse, GitHub API, Jira API

### Bubble — Production-Grade RAG Chatbot
*Apr 2025 – Present · [GitHub](https://github.com/elampt/elam-chatbot) · [Try it](https://elam-bubble-bot.streamlit.app/)*

Built an **agentic RAG chatbot** using LangChain, LangGraph, and FAISS with a **two-stage retrieval pipeline**: bi-encoder (FAISS) for fast recall → cross-encoder reranking for precision, with configurable relevance thresholds. Designed **config-driven architecture** with Pydantic validation and YAML config — switching LLM providers, embedding models, or retrieval parameters requires zero code changes. Improved chunking from 322 noisy fragments to 82 high-quality chunks.

**Tech:** Python, LangChain, LangGraph, FAISS, Sentence Transformers, Cross-Encoder Reranking, Pydantic, Streamlit

### FinSight — Stock Portfolio Tracker & Sentiment Analyzer
*May 2025 · [GitHub](https://github.com/elampt/finsight-frontend)*

Full-stack application with **FastAPI backend** (async endpoints, JWT auth, dependency injection), **PostgreSQL** database (Neon), real-time P&L tracking via yFinance, and news sentiment analysis using FinBERT. Deployed with Streamlit UI.

**Tech:** Python, FastAPI, PostgreSQL (Neon), yFinance, FinBERT, Streamlit, JWT

---

## Skills

**AI / GenAI:** LangChain, LangGraph, RAG, FAISS, Agentic AI, Sentence Transformers, Cross-Encoder Reranking, Prompt Engineering, LLM APIs (Groq, OpenAI), MCP

**Languages:** Python, SQL, Shell Scripting

**Backend:** FastAPI, REST API Design, Async Python, PostgreSQL, Redis, Pydantic, JWT Authentication, Rate Limiting

**Data & Infra:** PySpark, Apache Hive, HDFS, Airflow, Cron, Docker, Git, Postman

---

## Education

### B.Tech in Computer Science and Engineering · Amrita Vishwa Vidyapeetham University
*Coimbatore, India · Aug 2020 – May 2024 · CGPA: 7.29*

---

## Certifications

- **[Unsupervised Learning, Recommenders, Reinforcement Learning](https://www.coursera.org/account/accomplishments/certificate/SKHOEPOZF9ZA)** — DeepLearning.AI | Coursera *(Jun 2025)*
- **[Advanced Learning Algorithms](https://www.coursera.org/account/accomplishments/certificate/GL6RE24L3BNV)** — DeepLearning.AI | Coursera *(May 2025)*
- **[GenAI Intensive Course](../Tech/Courses/5---Day-Gen-AI-Course/)** — Google | Kaggle *(Apr 2025)*
- **[Supervised Machine Learning: Regression and Classification](https://www.coursera.org/account/accomplishments/certificate/6RLHDRFTBYDF)** — DeepLearning.AI | Coursera *(Feb 2023)*

---

## Publications

**[A Multi-Round Zero Knowledge Proof Algorithm for Secure IoT and Blockchain Environments](https://doi.org/10.18280/ijsse.130408)**
*International Journal of Safety and Security Engineering*

---

## Beyond Code

I also write about books I read, places I travel, and lessons I'm picking up along the way. The rest of [my digital garden](../) is open if you're curious.

---

## Get in touch

Open to **AI Engineer / Python / Backend** roles. Happiest when there's a hard problem and a small team.

[Email me](mailto:elambharathi.pt@gmail.com) · [LinkedIn](https://www.linkedin.com/in/elambharathithangavel/)
