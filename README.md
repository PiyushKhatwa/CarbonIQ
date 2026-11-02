# CarbonIQ — AI-Powered Carbon Emissions Footprint Tracker

[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL_16-blue.svg)](https://www.postgresql.org/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js_Express-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/Frontend-React_18_Vite-cyan.svg)](https://react.dev/)
[![Python](https://img.shields.io/badge/AI_Service-FastAPI-teal.svg)](https://fastapi.tiangolo.com/)

CarbonIQ is a full-stack, local-first web application designed for individuals and organizations to measure, track, analyze, and reduce greenhouse gas emissions. Developed as an **Advanced Database Management Systems (ADBMS)** academic project, it implements deterministic emission calculations, documented emission factor provenance, ACID transactions, database triggers, stored procedures, analytical views, and an AI recommendation engine with offline rule-based fallback.

---

## Key Features

- **Dual-Workspace Architecture:** Seamlessly switch between Personal and Organization workspaces with complete data isolation.
- **Traceable Emission Factors:** Emission factors cite recognized authorities (Central Electricity Authority, UK DEFRA, US EPA) with geographical and temporal validity windows.
- **Deterministic Calculation Engine:** Decimal-safe calculations that snapshot factor values with every record, guaranteeing reproducible historical metrics.
- **Academic ADBMS Demonstrations:**
  - 1NF, 2NF, and 3NF normalization.
  - Multi-table atomic transactions with verified rollback.
  - JSONB audit trail maintained by PostgreSQL triggers.
  - Analytical database views for monthly and category rollups.
  - Stored procedures for in-engine calculation and validation.
  - Concurrency safety and query performance optimization (`EXPLAIN ANALYZE`).
- **AI-Assisted Insights & Fallback:** Personalized reduction insights generated using Google Gemini or local rule-based intelligence without exposing sensitive user identifiers.
- **Modern Sustainability UI:** Polished forest green visual identity, responsive layouts, intuitive activity entry wizard, and Recharts analytics.

---

## Project Structure

```text
CarbonIQ/
├── frontend/               # Vite + React 18 + TailwindCSS + Lucide + Recharts
├── backend/                # Node.js + Express + pg connection pool
├── ai-service/             # Python FastAPI + Pydantic + Gemini/Rule-based engine
├── database/               # PostgreSQL migrations, seeds, triggers, views, procedures
│   ├── migrations/         # DDL scripts (tables, constraints, indexes)
│   ├── seeds/              # Emission taxonomies and demo data
│   ├── triggers/           # Audit trail trigger functions
│   ├── views/              # Analytical reporting views
│   ├── procedures/         # Stored procedures & calculation functions
│   ├── tests/              # SQL assertion & ADBMS demonstration scripts
│   └── README.md           # Database setup and pgAdmin inspection guide
├── docs/                   # Architectural decisions and data dictionary
├── PLAN.md                 # Development sprint tracker
├── TECHNICAL_NOTES.md      # Implementation notes and decisions
└── .env.example            # Master environment variable template
```

---

## Local Setup Prerequisites

1. **Node.js**: v20.x or higher
2. **PostgreSQL**: v16.x or higher running locally on port `5432`
3. **Python**: v3.11+
4. **pgAdmin 4** (Recommended for visual inspection)

See [database/README.md](file:///c:/Users/piyus/Desktop/advance%20database%20mangement%20system/ADBMS_project_co2_tracker/CarbonIQ/database/README.md) for detailed database provisioning and management instructions.

