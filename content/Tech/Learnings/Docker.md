---
title: Docker — From Zero to Production-Grade Containers
date: 2026-05-14
tags: [docker, devops, infrastructure]
---

# Docker

> Notes from learning Docker while containerizing my Jira Coding Agent project. Covers what I actually used + adjacent concepts I should know about.

## What is Docker?

Docker bundles your application **plus everything it needs to run** (Python version, system libraries, environment variables, OS) into a single portable unit called a **container**. The container runs the same way on any machine that has Docker.

### The Problem It Solves

Without Docker:

```
My laptop:    Python 3.10 + UV + Node 18 + npm + Git + ...
Friend's Mac: Python 3.9 + pip + Node 16 + maybe Git
AWS EC2:      Python 3.8 + missing npm + missing UV
```

→ "Works on my machine" but fails everywhere else.

With Docker:

```
Docker image → ships with EVERYTHING the app needs
              → runs identically on my Mac, friend's Mac, EC2, anywhere
```

### Real-World Analogy

Shipping containers revolutionized global trade because **the container is standardized** — any ship, truck, or port can handle any container. Doesn't matter if it's full of bananas, electronics, or coffee.

Docker does the same for software. Standardized format, runs anywhere Docker runs.

## Core Concepts

### Image vs Container

These two terms confused me at first. They are **not** the same thing.

| | Image | Container |
|--|-------|-----------|
| What | A frozen blueprint | A running instance of an image |
| Mutable? | No (read-only) | Yes (writes to a thin writable layer) |
| Analogy | A class | An object (instance of class) |
| Stored | On disk | Running in memory + on disk |
| Example | `python:3.10` (ready to use) | `my-app` running on port 8000 |

**One image → many containers.** You can run 5 containers from the same image, each independent.

```
              Image: python:3.10
                    │
       ┌────────────┼────────────┐
       ▼            ▼            ▼
  Container 1  Container 2  Container 3
  (port 8000)  (port 8001)  (port 8002)
```

### Dockerfile

A `Dockerfile` is the **recipe** for building an image. Plain text file with step-by-step instructions.

```dockerfile
FROM python:3.10              # Start with a Python 3.10 base image
WORKDIR /app                  # Set working directory inside container
COPY requirements.txt .       # Copy file from host into container
RUN pip install -r requirements.txt   # Run a command during build
COPY . .                      # Copy the rest of the code
CMD ["uvicorn", "main:app"]   # The command that runs when container starts
```

When you run `docker build`, Docker reads these instructions one by one and builds the image.

### Layers + Caching (Why Order Matters)

Each instruction in a Dockerfile creates a **layer**. Docker caches each layer.

```dockerfile
COPY requirements.txt .                    ← Layer 1
RUN pip install -r requirements.txt        ← Layer 2 (slow — installs lots)
COPY . .                                   ← Layer 3 (just copies code)
```

**If you change your code** (Layer 3), Docker reuses cached Layers 1 and 2 — only Layer 3 rebuilds. Fast.

**If you change requirements.txt** (Layer 1), Docker invalidates everything after — Layers 2 and 3 rebuild. Slow.

**Wrong order (bad caching):**
```dockerfile
COPY . .                                   ← Code changes invalidate this
RUN pip install -r requirements.txt        ← And this re-runs every time
```
Every code change triggers a full reinstall. Bad.

**Right order (good caching):**
```dockerfile
COPY requirements.txt .                    ← Rarely changes
RUN pip install -r requirements.txt        ← Cached
COPY . .                                   ← Code changes only invalidate from here
```

**Rule:** Put rarely-changing things at the top. Code at the bottom.

### Multi-Stage Builds

A modern Dockerfile pattern. **Use one image to BUILD, a smaller image to RUN.**

```dockerfile
# Stage 1: builder
FROM python:3.10 AS builder
RUN pip install --user some-heavy-build-tool
# ... build the app ...

# Stage 2: runtime
FROM python:3.10-slim       ← much smaller base
COPY --from=builder /app /app    ← copy only what we need from builder
CMD ["python", "app.py"]
```

The final image only contains stage 2. All the bulky build tools from stage 1 are discarded.

**Why it matters:**
- Image size drops 50-70%
- Smaller image = faster deployments, less attack surface
- Strong production-grade signal

### .dockerignore

Like `.gitignore`, but for Docker. Tells Docker what NOT to include in the build context.

```
.venv/
__pycache__/
.git/
*.pyc
workspace/
screenshots/
data/
```

**Why it matters:**
- Smaller build context = faster builds
- Prevents secrets from accidentally being baked into the image
- Without it, `COPY . .` would copy your entire `.venv/` (gigabytes!)

### Environment Variables

Pass configuration without baking it into the image:

```bash
docker run -e DATABASE_URL=postgres://... my-app
```

Inside the container:
```python
import os
db_url = os.getenv("DATABASE_URL")
```

For multiple env vars, use a `.env` file:
```bash
docker run --env-file .env my-app
```

**Critical:** Never `COPY .env .` into the image. Secrets get baked in and exposed.

### Port Mapping

Containers have their own network. To expose a port to your host machine:

```bash
docker run -p 8000:8000 my-app
         #    ↑    ↑
         #    │    └── port INSIDE the container
         #    └────── port on your HOST (laptop/EC2)
```

You can map differently:
```bash
docker run -p 80:8000 my-app   # host port 80 → container port 8000
```

### Volumes

Containers are **ephemeral** — when the container is deleted, everything inside is gone. To persist data, mount a **volume**:

```bash
docker run -v /host/path:/container/path my-app
```

Common uses:
- Database data (Postgres, Redis)
- Log files
- User uploads

For our Jira agent project, we'd mount `.env` so the container reads it without baking secrets in.

### Non-Root User

By default, processes inside a container run as `root`. **Don't do this in production.**

```dockerfile
RUN adduser --disabled-password appuser
USER appuser
CMD ["python", "app.py"]
```

If the container gets compromised, an attacker has root inside the container. That's bad, even though container escape is rare. Always run as a non-root user.

### Health Checks

Tell Docker how to check if your app is healthy:

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:8000/health || exit 1
```

Docker automatically restarts unhealthy containers (with the right restart policy).

## Docker Compose

For multi-container apps, writing long `docker run` commands gets tedious. `docker-compose.yml` describes everything in YAML:

```yaml
services:
  api:
    build: .
    ports:
      - "8000:8000"
    env_file: .env

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
```

Then:
```bash
docker compose up      # start everything
docker compose down    # stop everything
docker compose logs api  # view logs
```

**When to use Compose:**
- Local development (run the app + its database together)
- Single-host deployments
- Demo/staging setups

**When NOT to use Compose:**
- Multi-server production (use Kubernetes or ECS)

## Common Docker Commands

```bash
# Build an image from current directory's Dockerfile
docker build -t my-app:latest .

# List images
docker images

# Run a container (detached, named, port-mapped)
docker run -d --name jira-agent -p 8000:8000 my-app:latest

# List running containers
docker ps

# View logs
docker logs -f jira-agent

# Stop a container
docker stop jira-agent

# Remove a stopped container
docker rm jira-agent

# Remove an image
docker rmi my-app:latest

# Open a shell INSIDE a running container (for debugging)
docker exec -it jira-agent /bin/bash

# Remove ALL stopped containers, unused networks, dangling images
docker system prune
```

## Adjacent Concepts (What Else You Should Know)

### Docker Hub & Registries

A **registry** is where images live. Like GitHub but for Docker images.

- **Docker Hub** — the default public registry. `docker pull python:3.10` pulls from Docker Hub.
- **GitHub Container Registry (ghcr.io)** — Docker images on GitHub.
- **Amazon ECR** — AWS's private registry. Pay-per-storage.

```bash
docker push username/my-app:latest    # publish to Docker Hub
docker pull username/my-app:latest    # download from Docker Hub
```

### Image Tags

`python:3.10` — `python` is the name, `3.10` is the tag.

Common tag patterns:
- `latest` (avoid in production — ambiguous)
- `1.2.3` (semantic versioning)
- `abc123` (git commit SHA)
- `v1.2.3-prod` (versioned + environment)

In production, **always use specific tags**, not `latest`. Otherwise you don't know what version is running.

### BuildKit

Modern Docker build engine (default in newer Docker versions). Parallel layer builds, better caching, secrets handling. You're using it without realizing it.

### Image Size Optimization — CPU-Only Dependencies (Real Lesson)

My Jira agent initial Docker image was **6 GB**. After investigating, I found that the default `torch` package on PyPI ships with ~4.5 GB of `nvidia-*` and `triton` libraries — for GPU acceleration I'd never use on a CPU-only EC2 t3.micro.

Fix: route torch to PyTorch's CPU-only index in `pyproject.toml`:

```toml
[[tool.uv.index]]
name = "pytorch-cpu"
url = "https://download.pytorch.org/whl/cpu"
explicit = true

[tool.uv.sources]
torch = { index = "pytorch-cpu" }
```

Result: 6 GB → 800 MB (87% reduction). Same code, same APIs, same speed on CPU.

**General principle:** for any ML library shipping with GPU support, check if a CPU-only variant exists. Cloud deployments rarely use GPU; bundling unused CUDA libs is pure waste — disk, bandwidth, build time, attack surface.

### Multi-Architecture Builds (Lesson From My Deployment)

By default, `docker build` produces an image for **your current machine's architecture**. On Apple Silicon Mac, that's ARM64. On Intel/AMD, that's amd64 (x86_64).

If you build on Apple Silicon and try to run on x86_64 (like most cloud VMs), you'll get:

```
no matching manifest for linux/amd64 in the manifest list entries
```

**Fix:** use `docker buildx` to cross-compile:

```bash
docker buildx build --platform linux/amd64 -t myimage:latest --push .
```

For images deployed to both ARM and Intel/AMD hosts:

```bash
docker buildx build --platform linux/amd64,linux/arm64 -t myimage:latest --push .
```

Buildx emulates the target platform on your local machine. Builds are slower than native (especially when emulating x86 on Apple Silicon), but it's the right way to ship cloud-deployable images from a Mac.

### Docker Networks

Containers in the same network can find each other by name:

```yaml
services:
  api:
    image: my-app
  db:
    image: postgres
```

The `api` container can connect to `db` using the hostname `db` — Docker handles DNS internally. No need for IP addresses.

### Compose vs Kubernetes

| | Docker Compose | Kubernetes (K8s) |
|--|---------------|------------------|
| Scale | Single host | Many hosts (cluster) |
| Complexity | Easy | Hard |
| Use case | Dev, small apps | Large production |
| File format | `docker-compose.yml` | YAML manifests, Helm charts |

For our project, Compose is right. K8s is overkill for a single-instance deployment.

## My Project: Containerizing the Jira Coding Agent

For the Jira Coding Agent, the container needs:

| Need | Why |
|------|-----|
| Python 3.10 | Run the agent |
| UV | Install Python deps |
| Git | Agent runs `git clone`, `git push` |
| Node.js + npm | Agent runs `npm test` on target React repo |
| (optional) Chromium for Playwright | Visual verification screenshots |

This is a **multi-tool environment** — more complex than a typical Python-only image. Final design:

- **Multi-stage build** (builder + runtime) → smaller final image
- **CPU-only torch** via PyTorch CPU index → 6 GB → **800 MB** image
- **Skip Playwright at runtime** via `ENABLE_VISUAL_VERIFICATION=false` env var
- **Non-root user** (`appuser`) → security
- **Health check** on `/health` endpoint
- **`.dockerignore`** to exclude `.venv/`, `workspace/`, `screenshots/`, `.env`
- **`--no-cache`** on `uv sync` → no dead cache layers in the image
- **`--restart unless-stopped`** at runtime → survives EC2 reboots automatically

Deployed live at: https://jira-agent.elambharathi.com
GitHub: https://github.com/elampt/jira-coding-agent

## Interview Talking Points

> "I containerized the project using a multi-stage Dockerfile that produces an 800 MB image. The builder stage installs Python dependencies via UV, the runtime stage copies only the `.venv` and source. I cut 87% of the image size by routing torch to PyTorch's CPU-only index — the default torch ships with ~4.5 GB of nvidia/CUDA libraries we'd never use on a CPU-only EC2 instance. The container runs as a non-root user with a health check, supports auto-restart, and Playwright is opt-in via env var since browser binaries aren't shipped in the production image. Deployed on AWS EC2 t3.micro behind Caddy as a reverse proxy for automatic HTTPS via Let's Encrypt."

## What I'd Learn Next

- Kubernetes basics (Pods, Deployments, Services)
- Docker security scanning (Trivy, Snyk)
- Multi-architecture builds (`linux/amd64` + `linux/arm64`)
- Sidecar containers and init containers
- Container image signing (cosign)
