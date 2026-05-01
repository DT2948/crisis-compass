# CrisisCompass
### Crisis Intelligence & Coordination Platform
**IBM WatsonX Experimental Learning Lab | May 2026**  
**Team: Darsh Tejusinghani, Abdul Samad, Alice Matarause**  

---

## Overview

CrisisCompass is an AI-powered crisis intelligence and situational awareness platform built for the IBM WatsonX Experimental Learning Lab. When a crisis strikes, whether a flood, wildfire, or public health emergency, relief organizations are forced to make high-stakes decisions from fragmented information spread across weather services, news outlets, social media, and government alerts. CrisisCompass aggregates these signals simultaneously, profiles the vulnerability of affected communities, matches relevant relief organizations, and surfaces coverage gaps in real time.

It does not dispatch or direct. It informs. Organizations see who needs what, what others are already doing, and where critical gaps remain uncovered.

---

## The Problem

During active emergencies, crisis coordinators face three compounding failures:

1. Fragmented information. FEMA, Weather.gov, news, and social media each hold a piece of the picture, but no coordinator sees all of it at once.
2. No shared operating picture. Every organization works from its own incomplete view, causing duplication in some areas and complete gaps in others.
3. Invisible gaps. Marginalized communities with elderly residents, language barriers, or limited mobility are disproportionately left behind, not because no organization could help, but because the right organization never received the right information in time.

---

## The Solution

CrisisCompass provides three capabilities that are rarely available together in one crisis coordination tool:

- A unified intelligence picture synthesized from multiple real-time sources, including conflict detection when sources disagree
- A shared live view of which organizations are responding and what they are covering
- An automated Gap Alert that fires when a critical community need has no confirmed responder

This final capability is the core differentiator. CrisisCompass is designed to make invisible coordination failures visible before they become humanitarian failures.

---

## Demo Scenario

A flash flood hits Eastside District, Philadelphia. The community is 41% elderly and 48% Spanish-speaking. FEMA understates severity, and CrisisCompass escalates conditions to **CRITICAL** based on Weather.gov and social signals. Three organizations are evaluated. Red Cross confirms emergency shelter. No organization confirms bilingual elder care. The Gap Alert fires, and Philadelphia Elder Care Alliance is recommended for immediate escalation.

---

## Features

### Real-time Signal Intelligence

CrisisCompass aggregates signals from FEMA IPAWS, Weather.gov, news feeds, and social media simultaneously. It detects conflicts between sources and highlights discrepancies. When official alerts lag behind ground conditions, CrisisCompass surfaces the disagreement clearly and escalates severity when necessary.

### Community Vulnerability Scoring

The platform maps U.S. Census-style demographic indicators such as elderly population share, language barriers, disability rates, and income level to a vulnerability score from 0 to 100. This helps coordinators understand not only where the crisis is happening, but which populations are most at risk.

### Targeted Intelligence Pings

Relief organizations are matched to community needs based on capabilities, languages, and geographic coverage. Each organization receives a tailored intelligence brief explaining exactly why it is relevant to the crisis.

### Response Coverage Tracker

Every matched organization moves through explicit response states so coordinators can see who has been notified, who has confirmed, and where response is still pending.

### Gap Alert System

When critical needs remain uncovered, CrisisCompass generates a Gap Alert that identifies the unmet needs, describes the consequences, and recommends the best-fit escalation target. This is the central insight layer of the platform.

### Response States

Every organization progresses through four states:

`needs_identified → ping_sent → response_confirmed → gap_flagged`

---

## Technical Architecture

### Frontend

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Leaflet and React-Leaflet for crisis mapping
- Polling-based live dashboard refresh every 10 seconds
- Dark operations dashboard theme optimized for crisis coordinators

### Backend

- FastAPI for API routing and orchestration
- SQLAlchemy for data modeling
- SQLite for persistent local storage
- Pydantic for schema validation and response typing

### AI Pipeline - IBM WatsonX Orchestrate

Five specialized AI agents were designed inside IBM WatsonX Orchestrate, powered by GPT-OSS 120B via Groq:

| Agent | Function |
|---|---|
| Signal Aggregation Agent | Synthesizes multi-source signals and detects conflicts |
| Crisis Intake Agent | Extracts a structured crisis profile from raw alert content |
| Community Needs Agent | Computes vulnerability score and ranked community needs |
| Org Matching Agent | Matches and briefs relevant relief organizations |
| Gap Detection Agent | Fires alerts when critical needs go unconfirmed |


---

## WatsonX Integration - Technical Approach and Honest Account

### What We Built in WatsonX Orchestrate

The full five-agent pipeline was designed, built, and tested entirely within IBM WatsonX Orchestrate. Each agent was configured with a detailed system prompt, structured input and output expectations, and a defined handoff to the next stage in the flow. The pipeline was confirmed working end to end with a total runtime of approximately 25 seconds.

The flow accepts eight structured inputs:

- FEMA signal
- Weather.gov signal
- News signal
- Social signal
- Location hint
- Community demographics
- Organization profiles
- Confirmed responses

It returns a structured result covering all five agent outputs, including signal synthesis, crisis profiling, vulnerability scoring, organization matching, and gap detection.

### The External API Challenge

Our original architecture called for the FastAPI backend to invoke the WatsonX Orchestrate pipeline via REST API, receive the structured result, and serve it directly to the dashboard. We spent significant time attempting to implement this integration.

After extensive investigation, including testing multiple endpoint formats, authentication methods, and URL structures, we determined that the external REST API for WatsonX Orchestrate is not available on the Trial tier provided through the IBM SkillsBuild program. The chat completions endpoint:

`/api/v1/orchestrate/{agent_id}/chat/completions`

consistently returned authentication errors, including `WXO_PEM - kid not found`, despite valid IBM Cloud credentials. The issue was not the pipeline itself. The issue was the tier restriction of the SkillsBuild environment, which does not expose the authentication path required for backend-driven external calls.

### How We Resolved It

Rather than abandon the dashboard integration, we implemented the backend pipeline response as structured hardcoded data that exactly mirrors the confirmed output of a real pipeline run. The dashboard renders this data in the same format it would use for live Orchestrate output.

The demo therefore demonstrates two distinct artifacts:

1. The live WatsonX Orchestrate flow running inside Orchestrate, showing all five agents executing in sequence
2. The CrisisCompass dashboard consuming the equivalent structured output and presenting the intelligence picture, response tracker, and Gap Alert workflow

In a production deployment with enterprise-tier WatsonX Orchestrate API access, the FastAPI backend would call the pipeline directly and the dashboard would update from live model output in real time.

---

## Data Sources

| Source | What It Provides | Access |
|---|---|---|
| FEMA IPAWS API | Official emergency alerts | Free, no auth |
| Weather.gov API | Live weather alerts by state | Free, no auth |
| U.S. Census ACS5 API | Community demographic data | Free, API key |
| Team-created org profiles | Relief organization capability data | Simulated |

---

## Project Structure

```text
crisis-compass/
├── backend/
│   ├── main.py                  # FastAPI app entry point
│   ├── database.py              # SQLAlchemy setup
│   ├── pipeline.py              # Demo pipeline orchestration/output
│   ├── crisis_utils.py          # Shared crisis and gap helpers
│   ├── api/
│   │   ├── crisis.py            # Crisis routes
│   │   ├── response.py          # Response tracking + simulation routes
│   │   └── gaps.py              # Gap alert routes
│   ├── models/                  # SQLAlchemy models
│   ├── schemas/                 # Pydantic schemas
│   └── seed_data.py             # Demo organization seed data
├── web/
│   ├── app/
│   │   ├── globals.css          # Global dashboard styles
│   │   └── page.tsx             # Main dashboard
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── Map.tsx
│   │   ├── CrisisFeed.tsx
│   │   ├── CrisisCard.tsx
│   │   ├── CrisisDetail.tsx
│   │   ├── SignalIntelligencePanel.tsx
│   │   └── StateBadge.tsx
│   ├── hooks/
│   │   └── useCrisisDashboard.ts
│   ├── lib/
│   │   └── api.ts
│   └── types/
│       └── crisis.ts
├── docs/
└── README.md
```

---

## Data Model

The backend stores the operational state required for the dashboard demo:

- `Crisis` - top-level crisis metadata and alert text
- `CommunityProfile` - location-linked vulnerability profile and top needs
- `Organization` - response partner capabilities, languages, and coverage areas
- `ResponseTracking` - per-organization response state for a crisis
- `GapAlert` - fired escalation records when critical needs remain uncovered
- `PipelineResult` - stored structured pipeline output used by the dashboard intelligence views

---

## Setup and Running Locally

### Backend

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload
```

Backend runs at `http://localhost:8000`  
API docs are available at `http://localhost:8000/docs`

### Frontend

```bash
cd web
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`

---

## Environment Variables

Create `backend/.env`:

```env
DATABASE_URL=sqlite:///./crisis_compass.db
```

Create `web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## API Routes

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/crisis/trigger` | Trigger the full crisis pipeline for a location |
| GET | `/api/crisis/active` | Get all active crises |
| GET | `/api/crisis/{id}` | Get full crisis detail |
| GET | `/api/crisis/{id}/sources` | Get signal intelligence data |
| GET | `/api/crisis/{id}/matches` | Get matched organizations |
| GET | `/api/crisis/{id}/gap` | Get gap detection status |
| POST | `/api/response/confirm` | Confirm an organization response |
| POST | `/api/response/simulate-elapsed` | Manually trigger elapsed-time gap detection |
| GET | `/api/gaps/active` | Get all active gap alerts |

---

## Demo Instructions

1. Start the backend and frontend using the setup steps above.
2. Open `http://localhost:3000`.
3. Click **Trigger Pipeline** in the header.
4. Watch the crisis card appear on the Pennsylvania map.
5. Click the crisis card to expand it.
6. Review the Signal Intelligence Panel, including four source cards, discrepancy handling, and AI summary.
7. Click **Confirm Response** on Red Cross Philadelphia.
8. Click **Simulate Time Elapsed**.
9. Watch the Gap Alert fire as unconfirmed needs surface and response states turn red.

This staged flow is intentionally designed to create a clear before-and-after coordination moment for the demo video.

### Demo Recording

https://psu.zoom.us/rec/share/nU8_qSzA2M72U3z1TUfQc-HSko_jdpaR7q1J_0auOZDr7l4G6U7UlcUd6BkNwXPk.p-TVgmu0DYFgELvL?startTime=1777671511000

---

## Why This Matters

CrisisCompass is not trying to replace emergency management systems or dispatch software. Its value is in surfacing coordination intelligence that existing tools often miss:

- Which vulnerable communities are most at risk
- Which organizations are actually positioned to help
- Which critical needs still have no confirmed response

In real disasters, that final question can determine whether entire populations are overlooked. CrisisCompass is designed to make that gap visible quickly enough for someone to act.

---

## Deliverables

- D1: 3-minute video demonstration
- D2: Written problem and solution statement with prototype link
- D3: Written technology statement covering all five WatsonX agents
- D4: This GitHub repository

---

## Built With

IBM WatsonX Orchestrate · IBM WatsonX.ai · GPT-OSS 120B via Groq · FastAPI · Next.js 14 · React 18 · TypeScript · Tailwind CSS · Leaflet · SQLAlchemy · SQLite · U.S. Census ACS5 API · FEMA IPAWS API · Weather.gov API

---

## Team

| Name | Role |
|---|---|
| Darsh Tejusinghani | Backend, frontend, WatsonX integration |
| Tahir Abdul Samad | WatsonX Orchestrate pipeline, all five agents |
| Alice [Last Name] | Data, organization profiles, written deliverables |

---

## Acknowledgment

Built as part of the **IBM SkillsBuild AI Experiential Learning Lab** at **Pennsylvania State University**, May 2026.
