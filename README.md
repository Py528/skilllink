# SkillLearn – Distributed Compute Platform for Everyone

**Run Blender, game engines, and heavy compute workloads from your browser — on a 4GB RAM laptop.**

---

## The Problem

If you're a student in India, you probably have a low-end machine. A 4GB RAM laptop that can't open Blender, can't run a game engine, can't do 3D rendering. The tools exist. The tutorials exist. The hardware doesn't.

Buying a powerful machine isn't an option for most people. Cloud subscriptions are expensive. So the gap between wanting to learn and being able to learn stays wide.

SkillLearn closes that gap.

---

## What It Does

SkillLearn distributes heavy compute workloads — 3D rendering, game development, app builds — across multiple low-powered machines and streams the output to your browser.

No GPU required. No cloud subscription. No expensive hardware.

If you have a 4GB RAM laptop and a network connection, you can run Blender.

---

## How It Works

The core insight: most machines are idle most of the time. A college lab at 11pm. A friend's laptop sitting unused. Two old Macs in a corner that nobody touches.

SkillLearn coordinates those machines into a single compute pool.

The hard problem was memory. On a single machine, a program loads into one contiguous RAM pool. Across machines that disconnect randomly and have inconsistent bandwidth, you need a distributed memory scheduler that:

- Partitions compute instances equally across nodes
- Handles node disconnection without dropping the session
- Rebalances load when machines join or leave the network
- Keeps the browser session alive regardless of what happens underneath

Think of it like a CPU core scheduler — but across a network of unreliable consumer hardware.

---

## What You Can Run

- 3D rendering (Blender)
- Game development
- App builds
- Any compute-heavy workload that would otherwise require expensive hardware

This isn't just a coding sandbox. Replit lets you write code. SkillLearn lets you render worlds.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js, TypeScript, Tailwind CSS |
| **Backend** | Node.js, REST APIs |
| **Database** | PostgreSQL, Redis |
| **Infrastructure** | Docker, distributed node orchestration |
| **Compute Distribution** | Custom distributed memory scheduler |
| **Storage** | AWS S3 |
| **Auth** | JWT, role-based access control |

---

## Architecture

```
Browser Client
      |
      v
Stream Layer (session persistence, reconnection logic)
      |
      v
Memory Scheduler (partitions workload across nodes)
      |
      ├── Node 1 (4GB RAM machine)
      ├── Node 2 (4GB RAM machine)
      └── Node 3 (4GB RAM machine)
```

Each node contributes compute. The scheduler ensures no single node holds the full workload. If a node drops, the session continues.

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- Docker
- PostgreSQL
- At least two machines on the same network (or Vultr free tier nodes)

### Installation

```bash
# Clone the repository
git clone https://github.com/Py528/skilllink.git

# Navigate into the project directory
cd skilllink

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start the node coordinator
npm run coordinator

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## Real Usage

- Deployed to students at COEP and PICT, Pune — first and second year students running software their laptops couldn't otherwise open
- Pitched at Microsoft
- Built entirely from scratch — no AI coding tools, no boilerplate. Docker orchestration, Blender integration, distributed memory scheduling, all written by hand

---

## What's Next

- [ ] Public node registry — let anyone contribute idle compute
- [ ] Paying client onboarding
- [ ] Mobile node support (contribute compute from your phone)
- [ ] Support for ML training workloads
- [ ] Per-user compute quotas and billing layer
- [ ] Constitutional agent layer — verify every compute request against user-defined rules before execution

---

## The Bigger Picture

There are billions of underpowered machines sitting idle right now. Students who want to learn but can't afford the hardware. Developers who want to build but are priced out of cloud compute.

SkillLearn is infrastructure for the next billion users who can't afford a MacBook Pro.

---

## Contributing

Contributions welcome. Fork the repo, create a branch, open a pull request.

---

## Contact

**Author:** Pranav Shinde  
**Email:** shinde.a.pranav@gmail.com  
**Website:** shindepranav.site  
**LinkedIn:** linkedin.com/in/pranaavshinde  
**GitHub:** [@Py528](https://github.com/Py528)

---

SkillLearn © 2025 – Distributed compute for everyone.
