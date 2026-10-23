# Chrysalis AI — Agentic Conversion Middleware (Frontend)

Modern, lightweight, and professional frontend for **Chrysalis AI**, an AI-powered middleware platform that ingests software requirements specifications and synthesizes verified multi-agent systems and topologies.

---

## 🚀 Quick Start

### 1. Install & Run Locally
```bash
# Install dependencies (if not already installed)
npm install

# Start development server
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 2. Connect with FastAPI Backend
By default, the frontend connects to `http://localhost:8000/api`. To customize, specify `VITE_API_BASE_URL` in an `.env.local` file:
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

To run the Chrysalis AI FastAPI backend:
```powershell
cd C:\Users\rohit\backend
.\.venv\Scripts\Activate.ps1
uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Verify Build & Linting
```bash
# Type check and production build
npm run build

# Run Oxlint
npm run lint
```

---

## 🏗️ 9-Stage Agentic Transformation Pipeline

1. **Ingestion & Analysis (`/requirements`):** Supports PDF upload, direct text input, and README markdown files. Extracts requirements, priorities, confidence scores, and source evidence citations.
2. **Adaptive Clarification Wizard (`/clarifications`):** 5-step questionnaire covering Primary Goal, Autonomy Level, Connectors, Data Mode, and Constraints.
3. **Confirmed Specification Review (`/specification`):** Formal gate requiring explicit user sign-off before generating architectures.
4. **Overall System Verdict (`/verdict`):** Objective categorization into **Non-agentic**, **Agentic**, or **Hybrid** with deterministic vs. agentic counts, assumptions, and risks.
5. **Architecture Synthesis & Selection (`/architectures`):** 3 candidate architectures with interactive SVG topologies, component breakdowns, estimated cost/latency, and selection locking.
6. **Predictive Scenario Simulation (`/simulations`):** Stress tests concurrency bursts, tool outages, and human approval gates with comparative benchmark charts.
7. **Source Code Generation (`/generation`):** File tree viewer with syntax-highlighted code preview and requirement-to-file traceability matrix.
8. **Static AST Validation (`/validation`):** Non-executing AST syntax parsing and schema validation with zero host execution risks.
9. **Demo & Export (`/demo`):** Direct ZIP package download via `GET /api/projects/{id}/download` and step-by-step local virtualenv execution instructions.

---

## 🎨 Theme & Design System

* **Light, Clean, Professional Theme:** Slate-50 background (`#F8FAFC`), crisp white cards (`#FFFFFF`), subtle slate borders (`#E2E8F0`), and dark high-contrast typography (`#0F172A`).
* **Restrained Accent Palette:** Deep indigo (`#4F46E5`), subtle emerald (`#059669`), sky blue (`#0284C7`), and amber warnings (`#D97706`).
* **No Fake Success:** Failed live requests display transparent error notifications and retry actions instead of silently pretending success.
