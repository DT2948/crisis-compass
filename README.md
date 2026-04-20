# CrisisCompass
### Crisis Intelligence & Coordination Platform
**IBM WatsonX Experimental Learning Lab | April 2026**

CrisisCompass is an AI-powered intelligence and situational awareness platform 
that aggregates real-time data from multiple sources, builds detailed profiles 
of affected communities, and delivers targeted, actionable intelligence to 
relevant relief organizations during active emergencies.

It does not dispatch or direct — it informs.

## Features
- Real-time crisis profiling from FEMA and news feeds
- Community vulnerability scoring using U.S. Census demographic data
- Targeted intelligence pings to matched relief organizations
- Live response coverage tracker
- Gap alert system — fires when critical needs go unconfirmed

## Tech Stack
- Backend: FastAPI, SQLAlchemy, SQLite
- Frontend: Next.js 14, React 18, TypeScript, Tailwind CSS, Leaflet
- AI: IBM WatsonX (Orchestrate,.ai,.data)

## Agents
| Agent | Function |
|---|---|
| Crisis Intake | Parses alert text into structured crisis profile |
| Community Needs | Scores vulnerability and identifies top needs |
| Org Matching | Matches and briefs relevant relief organizations |
| Gap Detection | Fires alerts when critical needs go unconfirmed |

## Response States
needs_identified → ping_sent → response_confirmed → gap_flagged

## Setup
```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

## Demo Scenario
Flash flood in Eastside District, Pennsylvania. High elderly population, 
significant Spanish-speaking residents. The platform ingests the crisis alert, 
scores community vulnerability, matches and pings relief organizations, tracks 
response confirmations, and fires a Gap Alert when bilingual elder care goes 
unconfirmed.
