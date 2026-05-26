---
title: AWS — Learning Cloud Through Deployment
date: 2026-05-21
tags: [aws, cloud, devops, infrastructure]
---

# AWS

> Notes from learning AWS while deploying my Jira Coding Agent project to production. Covers what I actually used + adjacent concepts I should know about for interviews.

## What is AWS?

**Amazon Web Services** is the largest cloud provider. Instead of buying physical servers and managing them yourself, you rent virtual servers, storage, databases, etc. from AWS, pay only for what you use, and scale up or down on demand.

### The Categories You'll Hear About

| Category | What it is | Examples |
|----------|-----------|----------|
| **Compute** | Run your code | EC2 (VMs), Lambda (serverless), ECS (containers) |
| **Storage** | Store files | S3 (objects), EBS (disks), EFS (file system) |
| **Database** | Managed databases | RDS (SQL), DynamoDB (NoSQL), ElastiCache (Redis) |
| **Networking** | Connect things | VPC (private network), Route 53 (DNS), CloudFront (CDN) |
| **Security** | Control access | IAM (users/roles), KMS (encryption), Secrets Manager |
| **Observability** | Monitor things | CloudWatch (logs/metrics), X-Ray (tracing) |

For a small project, you typically use a handful: **EC2 + IAM + CloudWatch + Security Groups + maybe S3**. That's it.

## EC2 (Elastic Compute Cloud)

EC2 = "rent a virtual machine."

### Instance Types

EC2 has dozens of instance types. They differ in:
- **vCPU count** (compute power)
- **Memory** (RAM)
- **Storage type** (SSD vs disk)
- **Network bandwidth**

Common families:

| Family | Best for |
|--------|----------|
| **t** (general purpose, burstable) | Web apps, small services — t2.micro, t3.small |
| **m** (general purpose, balanced) | Mid-size apps |
| **c** (compute-optimized) | CPU-heavy workloads |
| **r** (memory-optimized) | RAM-heavy workloads, databases |
| **g** (GPU) | ML training, GPU workloads |

### Free Tier Specifics

For 12 months from account creation:

| Resource | Free tier |
|----------|-----------|
| **EC2 t2.micro / t3.micro** | 750 hours/month (basically always-on) |
| **EBS disk (gp3)** | 30 GB free |
| **Bandwidth out** | 100 GB/month |

If you stay within these, EC2 costs $0.

### My Project: t3.micro Specs

| | Value |
|--|------|
| vCPU | 2 (burstable) |
| RAM | **1 GB** ← tight constraint |
| Disk | 20 GB gp3 (free tier covers 30 GB) |
| AMI | Ubuntu 26.04 LTS (amd64) — `ubuntu-resolute-26.04-amd64-server-20260421` |
| Network | Moderate |

1 GB RAM is the killer. Workaround: 2 GB swap file (free). Total effective: 3 GB.

In my region (ap-south-1, Mumbai), AWS only offered t3.micro as free tier (no t2.micro). t3 is the newer generation — 2 vCPU instead of 1, slightly better burst CPU performance. Same free tier limits.

## AMI (Amazon Machine Image)

An AMI is the **OS your EC2 starts with** — like choosing what's pre-installed before the machine boots.

Common AMIs:
- **Amazon Linux 2023** — AWS's optimized Linux. Good if you trust AWS defaults.
- **Ubuntu 22.04** — More familiar for most devs. Strong community docs.
- **Debian** — Lean.
- **Windows Server** — for Windows apps.

For our project, **Ubuntu 22.04 LTS** is the obvious pick:
- Wide community knowledge
- All your `apt-get` knowledge applies
- Docker installs easily

## Security Groups

A **virtual firewall** for your EC2 instance. Controls what IPs can connect on what ports.

A security group is a set of rules:

```
Inbound Rules:
  Port 22 (SSH)    from MY_IP_ONLY      ← so I can SSH in
  Port 80 (HTTP)   from 0.0.0.0/0       ← anyone on the internet
  Port 443 (HTTPS) from 0.0.0.0/0       ← anyone on the internet

Outbound Rules:
  All traffic       to 0.0.0.0/0        ← EC2 can call anywhere (LLM APIs etc.)
```

**Production best practices:**
- Never `0.0.0.0/0` on SSH — restrict to your IP
- Only open ports you actually need
- Use 443 (HTTPS) not 80 (HTTP) for real apps

## Key Pairs (SSH)

How you authenticate when connecting to your EC2 instance. SSH uses **asymmetric keys**:

```
Private key (.pem file)   ← stays on YOUR laptop. NEVER share.
Public key                ← lives on EC2 (AWS puts it there automatically)
```

When you SSH:
```
You: "I have this private key"
EC2: "Prove it by signing this challenge"
You: signs with private key
EC2: verifies with public key → grants access
```

Key files have `.pem` extension. Critical rules:
- File permissions must be `400` (read-only by owner) or SSH refuses
- Never check into git
- Backup somewhere safe

```bash
chmod 400 ~/keys/jira-agent.pem
ssh -i ~/keys/jira-agent.pem ubuntu@<EC2_IP>
```

## Elastic IP

By default, when you stop and restart an EC2 instance, **its public IP changes**. That breaks anything that has hardcoded the IP (like a Jira webhook).

**Elastic IP** = a static, persistent public IP you can attach to an EC2 instance. It stays the same even when the instance restarts.

| | Without EIP | With EIP |
|--|-------------|----------|
| Stop instance | New IP on restart | Same IP |
| Reboot | Same IP usually | Same IP |
| Cost | Free | Free **while attached to a running instance** |
| Cost (idle) | — | $3.60/month if unattached |

Rule: attach EIP to instance, leave instance running. Or release the EIP when you stop the instance for long periods.

## EBS (Elastic Block Storage)

The "hard drive" of your EC2 instance. Three things to know:

| Concept | What |
|---------|------|
| **Volume** | A disk you can attach to an EC2 instance |
| **Snapshot** | A backup of a volume — saved to S3 |
| **gp3** | Default modern volume type. Cheap, fast enough. |

For free tier, you get 30 GB. I provisioned 20 GB to leave headroom.

EBS volumes persist independently of the instance. If you terminate the instance, the volume is deleted by default UNLESS you uncheck "delete on termination."

## IAM (Identity and Access Management)

IAM = "who can do what in your AWS account."

Core concepts:

| | What |
|--|------|
| **User** | A person (or external system) with AWS credentials |
| **Role** | A set of permissions an AWS service can "assume" |
| **Policy** | A JSON document listing allowed/denied actions |
| **Group** | A collection of users with shared policies |

### IAM Roles for EC2

When your EC2 instance needs to access other AWS services (like S3), you don't put AWS credentials inside the instance. Instead, you assign the instance an **IAM role**.

```
EC2 instance has role "ec2-agent-role"
Role has policy: "can read/write S3 bucket xyz"

EC2 calls S3 → AWS automatically authenticates via the role
No credentials in code. No risk of leaks.
```

For our project we don't need any AWS service access yet, so no IAM role attached.

## CloudWatch

Where your logs and metrics go in AWS.

| Service | What |
|---------|------|
| **CloudWatch Logs** | Application + system logs |
| **CloudWatch Metrics** | Numeric metrics (CPU%, memory, custom) |
| **CloudWatch Alarms** | Trigger on metric thresholds |

For our project: we view container logs locally via `docker logs`. We could ship them to CloudWatch for production retention.

## Billing Alerts (DO THIS FIRST)

Set a billing alert **before** you do anything else.

```
1. Open AWS Billing Dashboard
2. Billing Preferences → Receive Free Tier Usage Alerts
3. Set CloudWatch billing alarm at $5
4. AWS will email you if anything starts costing money
```

Without this, you might accidentally provision something pricey (NAT Gateway, RDS, etc.) and not realize until the bill arrives.

## My Project: Deploying The Jira Coding Agent

### Architecture (Final)

```
[Jira Cloud]                                    [GitHub]
    │ webhook (HTTPS)                              ▲
    ↓                                              │ git push, PR create
[Cloudflare DNS] → resolves                        │
jira-agent.elambharathi.com → 3.110.251.128       │
    │                                              │
    ↓ HTTPS                                        │
[AWS Elastic IP]                                   │
    ↓                                              │
[Security Group: ports 22 (my IP), 80, 443]        │
    ↓                                              │
[Caddy reverse proxy] :443                         │
    │  - Auto-issues Let's Encrypt cert            │
    │  - Auto-renews every ~60 days                │
    ↓ proxies HTTP to localhost:8000               │
[Docker container] :127.0.0.1:8000                 │
    │  - Multi-stage build, 800 MB image           │
    │  - Auto-restart unless stopped               │
    ↓                                              │
[FastAPI + LangGraph agent]──────────────────────┘
    │
    ↓ (LLM API calls)
[Groq]
```

### What I Set Up

| Resource | Configuration |
|----------|--------------|
| EC2 instance | t3.micro, Ubuntu 26.04 LTS (amd64), 30 GB gp3 EBS |
| Security Group | Port 22 (SSH from my IP), Port 80 + 443 (HTTP/HTTPS from anywhere) |
| Key Pair | RSA, `jira-agent-key.pem`, stored at `~/keys/` with `chmod 400` |
| Elastic IP | 3.110.251.128 — stable IP across instance restarts |
| DNS | Cloudflare A record: jira-agent.elambharathi.com → EIP (DNS-only mode, NOT proxied) |
| Swap file | 2 GB swap (since t3.micro has only 1 GB RAM) |
| Docker | Installed via `apt-get install docker.io` |
| Image | Pulled from private Docker Hub repo, ~800 MB |
| Reverse proxy | Caddy with auto-HTTPS via Let's Encrypt (3-line Caddyfile) |
| Container port binding | `127.0.0.1:8000:8000` — only Caddy can reach it |

### Architecture Lessons Learned

**1. ARM vs amd64 mismatch** — I built the Docker image on Apple Silicon (ARM64) but EC2 t3.micro is x86_64. The first `docker pull` failed with `no matching manifest`. Fix: rebuild with `docker buildx build --platform linux/amd64 --push .`. Important gotcha for Mac users deploying to AWS.

**2. Image size matters for free-tier disk** — Initial image was 6 GB. The default 20 GB EBS volume couldn't fit it + workspace + node_modules. Two options: expand EBS (free tier allows up to 30 GB) or shrink the image. I did both — expanded to 30 GB AND switched torch to CPU-only (image dropped to 800 MB). The shrink was the right long-term fix.

**3. HTTP webhooks rejected by Jira** — Jira Cloud only accepts HTTPS webhooks. uvicorn was serving HTTP on port 80. Solution: Caddy as a reverse proxy. Caddy auto-issues Let's Encrypt certs and auto-renews them. 3-line Caddyfile, no manual cert management.

**4. New IPv4 charge (2024+)** — AWS now charges $0.005/hour for public IPv4 addresses, even auto-assigned ones. Free tier doesn't fully cover this. Real cost during free tier: ~$3.60/month for the IP. Plan accordingly.

**5. Backend behind proxy = bind to localhost** — Container originally listened on `0.0.0.0:8000`, exposed via `-p 80:8000`. After adding Caddy, switched to `-p 127.0.0.1:8000:8000`. Caddy is the only entry point; backend isn't directly reachable from the internet. Standard production pattern.

### Costs (Reality Check)

The "12 months free" marketing is partially true. For Indian accounts billed by Amazon Web Services India Private Limited, free tier is more limited than US/global accounts. Actual costs for my setup:

| Item | Monthly cost (Indian AWS account) |
|------|----------------------------------|
| EC2 t3.micro running 24/7 | ~$8 |
| EBS 30 GB gp3 | ~$1.80 |
| Public IPv4 (Elastic IP) | ~$3.60 (new 2024 charge) |
| Bandwidth out | ~$0 (under 100 GB/month free) |
| **Total** | **~$13/month** |

Strategy for cost control:
- **Stop instance when not actively demoing** — saves the $8 compute charge
- Keep EBS (cheap, preserves config) + EIP (preserves URL)
- Idle cost: ~$5/month

Worth it for the deployment story on a resume during active job search. Stop the instance the day I accept an offer.

## Reverse Proxy + HTTPS (Production Pattern)

This isn't AWS-specific but is the most common pairing for EC2-deployed apps. Worth knowing in depth.

### Why You Need A Reverse Proxy

A backend application server (uvicorn, gunicorn, etc.) is **good at running your app**. It's NOT designed for:
- TLS/SSL certificate management
- Serving on port 443 with proper HTTPS handshake
- Auto-renewing certificates
- Routing to multiple backends

A **reverse proxy** sits between the internet and your app. It handles all of that, then forwards plain HTTP to your app on a private port.

```
Internet → Proxy (port 443, HTTPS) → App (port 8000, HTTP, localhost only)
```

### Caddy vs nginx

| | Caddy | nginx |
|--|-------|-------|
| Release | 2015 | 2004 |
| HTTPS setup | Automatic | Manual (certbot + cron) |
| Config size for SSL+proxy | 3 lines | ~30 lines |
| Cert renewal | Built-in | Manual / separate tool |
| Production usage | Modern startups | Legacy ubiquity |

For new projects: Caddy. For existing nginx deployments: probably stick with nginx.

### Caddy Configuration Example

```caddyfile
jira-agent.elambharathi.com {
    reverse_proxy localhost:8000
}
```

That's it. Caddy:
1. Listens on ports 80 and 443
2. Sees a request for the domain
3. On first request, contacts Let's Encrypt, proves ownership, obtains cert
4. Serves HTTPS from that point on
5. Auto-renews ~30 days before expiry

### Let's Encrypt — The Free Cert Authority

Before 2016, getting an SSL cert cost $50-200/year. Let's Encrypt changed that — free certs, auto-issued via the ACME protocol. Caddy uses ACME automatically.

Cert validity: 90 days. Designed for automation — manual renewal isn't feasible, you have to script it (or use Caddy which does it for you).

### Verification Challenge

Let's Encrypt verifies you own the domain before issuing:
1. Caddy: "I want a cert for jira-agent.elambharathi.com"
2. Let's Encrypt: "Serve this random file at http://jira-agent.elambharathi.com/.well-known/acme-challenge/abc..."
3. Caddy: serves the file
4. Let's Encrypt: fetches the file, verifies, issues the cert

This requires:
- DNS pointing the domain at your server (already done)
- Port 80 open to the internet (Caddy uses it briefly)

If DNS isn't set up yet, the challenge fails. So always: DNS first, then start Caddy.

## Adjacent Concepts (What Else You Should Know)

### VPC (Virtual Private Cloud)

Your isolated network on AWS. Every account has a **default VPC** with subnets in each availability zone. For small projects, the default VPC is fine.

### Regions and Availability Zones (AZs)

```
Region (geographic area)    ← e.g., us-east-1, ap-south-1 (Mumbai)
   ├── AZ-a (data center)
   ├── AZ-b (data center)
   └── AZ-c (data center)
```

For Indian users, **ap-south-1 (Mumbai)** has the lowest latency. For my Jira (Atlassian is global), it doesn't matter much.

### S3 (Simple Storage Service)

Object storage. Used for:
- Static website hosting
- File storage that doesn't fit in an EBS volume
- Backups and snapshots
- Storing user-uploaded files

For our project: I could store agent screenshots in S3 if we kept them. We don't — they're in the PR branch.

### ECR (Elastic Container Registry)

AWS's Docker Hub. Stores private container images.

| | Docker Hub | ECR |
|--|-----------|-----|
| Cost | Free for personal projects | $0.10/GB-month |
| Private | 1 free repo | All repos private |
| Best for | Demos, OSS | AWS-native production |

For our project: Docker Hub is fine. ECR would be better in real production.

### ECS / Fargate

**ECS (Elastic Container Service)** — AWS-native container orchestration.

**Fargate** — "serverless" containers. You don't manage EC2 instances; AWS runs them for you. Costs more but no instance management.

| | EC2 (what we do) | ECS Fargate |
|--|------------------|-------------|
| Manage instance | Yes (apt-get, docker install, ssh) | No |
| Cost | EC2 cost only | Slightly more (~30%) |
| Scaling | Manual (or auto-scaling groups) | Easy auto-scaling |

For demos: EC2 is fine. For real production: Fargate is the smart choice.

### Lambda (Serverless Functions)

For workloads that:
- Run briefly (max 15 min)
- Are triggered by events (HTTP requests, S3 uploads, cron schedules)
- Don't need persistent state

**Wouldn't work for our agent** because we need long-running processes (npm install takes 30+ seconds, agent runs for minutes). Lambda's 15-minute hard limit and stateless model don't fit.

But for a Jira webhook receiver that just **enqueues work** to another system? Perfect Lambda use case.

### API Gateway

A way to expose Lambda functions as HTTP endpoints. Pair Lambda + API Gateway for "serverless backend." Skip for now.

### RDS (Relational Database Service)

Managed databases (Postgres, MySQL). AWS handles backups, patching, replication.

For our project: we don't have a database. If we did, RDS would be the production answer.

### Auto Scaling

"Add more instances when load goes up." Requires:
- Auto Scaling Group (template + min/max)
- Load Balancer (distributes traffic)
- CloudWatch (triggers based on CPU/RAM)

Not relevant for our demo. Production AI services use this for elasticity.

### CloudFormation / Terraform

**Infrastructure as Code** — define your AWS resources in YAML/HCL files instead of clicking in the console.

| | CloudFormation | Terraform |
|--|----------------|-----------|
| Made by | AWS | HashiCorp |
| Format | YAML/JSON | HCL |
| Multi-cloud | AWS only | Yes (Azure, GCP, AWS) |

Many JDs mention Terraform. For my project I used the Console (point-and-click) — Terraform is the next thing to learn after I'm comfortable with the resources themselves.

### Systems Manager (SSM)

A modern alternative to SSH. Connects to EC2 instances through AWS's network, no SSH keys, no inbound port 22 needed.

| | SSH | SSM Session Manager |
|--|-----|---------------------|
| Setup | Easy | Needs IAM role on instance |
| Security | OK (with key + restricted SG) | Better (no inbound port, fully logged) |

I used SSH for simplicity. SSM is the production-grade choice.

## Common Mistakes to Avoid

| Mistake | What happens |
|---------|--------------|
| Not setting billing alert | Surprise bill at end of month |
| Leaving an Elastic IP unattached | $3.60/month for nothing |
| Opening SSH (port 22) to 0.0.0.0/0 | Anyone can try to brute-force into your instance |
| Not stopping instance when not needed (post free tier) | Pays for unused compute |
| Storing AWS credentials in code | Massive security risk |
| Using `root` AWS user for daily work | Reset password if compromised = nightmare |

## Interview Talking Points

> "I deployed my Jira Coding Agent on AWS EC2 t2.micro (Ubuntu) inside the free tier. Configured a security group restricting SSH to my IP and exposing port 80 for the public webhook. Attached an Elastic IP so the Jira webhook URL stays stable across instance restarts. The container image was 6 GB so I added a 2 GB swap file to fit the t2.micro's 1 GB RAM. Image was pushed to a private Docker Hub repo. For a higher-traffic production deployment, I'd move to ECS Fargate to remove instance management, add CloudWatch alarms, and rebuild the deployment as Terraform code for repeatability."

## What I'd Learn Next

- Terraform — to convert this deployment to Infrastructure as Code
- ECS Fargate — production-grade container hosting
- Application Load Balancer + Auto Scaling — for elasticity
- CloudFront — CDN for static assets
- AWS Secrets Manager — to remove `.env` files entirely
- VPC deep dive — private/public subnets, NAT gateways
