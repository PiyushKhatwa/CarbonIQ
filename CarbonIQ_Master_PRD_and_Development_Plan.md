# CarbonIQ --- Master Product Requirements Document & Development Plan

**Project:** CarbonIQ --- AI-Powered Carbon Emissions Footprint Tracker\
**Document type:** Master PRD + Technical Architecture + Implementation
Plan\
**Version:** 1.0\
**Status:** Development baseline\
**Team:** 2 students\
**Primary academic subject:** Advanced Database Management Systems
(ADBMS)\
**Development approach:** Local-first; deployment after a stable, tested
MVP

------------------------------------------------------------------------

## 1. Product vision

CarbonIQ is a user-friendly web application that helps individuals and
organizations record activities that generate greenhouse-gas emissions,
calculate their carbon footprint using documented emission factors,
understand historical trends, and receive practical, personalized
reduction recommendations.

The product must be more than a CRUD application. Its database design
and implementation must visibly demonstrate ADBMS concepts such as
relational integrity, normalization, transactions, concurrency control,
stored procedures, triggers, views, indexing, and query optimization.

**Product principle:** Make carbon tracking understandable for a
non-technical user while keeping calculations transparent, traceable,
and technically defensible.

### 1.1 Product goals

1.  Make it easy to record common emission-generating activities.
2.  Calculate emissions in kilograms of carbon-dioxide equivalent (kg
    CO2e).
3.  Support both personal and organization-level tracking.
4.  Show clear dashboards, trends, category breakdowns, and goals.
5.  Provide explainable AI-assisted insights and actionable
    recommendations.
6.  Preserve the exact emission-factor version used for every
    calculation.
7.  Demonstrate meaningful advanced database functionality for the ADBMS
    evaluation.
8.  Provide a polished, responsive, accessible interface that is easy to
    learn.

### 1.2 Non-goals for the first release

-   Real-time IoT/smart-meter integrations.
-   Automatic access to bank, utility, vehicle, or government accounts.
-   Carbon-credit trading, offset purchases, or certification.
-   Claiming regulatory compliance or independently verified corporate
    reporting.
-   Training a custom machine-learning model from scratch.
-   Complex enterprise approval workflows.
-   Native mobile applications.

These may be considered only after the core application is stable.

------------------------------------------------------------------------

## 2. Users, roles, and permissions

CarbonIQ supports individuals and organizations. A person may have a
personal account and also be a member of one or more organizations.

### 2.1 Roles

**Individual user** - Register, sign in, and manage their profile. -
Record personal activities. - View personal emissions and historical
trends. - Set personal reduction goals. - View AI-assisted
recommendations. - Export personal reports.

**Organization owner/admin** - Create and manage an organization. -
Invite or add members (initial MVP may use admin-managed membership if
invitations add too much complexity). - Create and manage departments. -
Record organization-level activities. - View organization and department
dashboards. - Set organization goals. - View organization reports and
recommendations.

**Organization member** - Record activities for permitted departments. -
View only organization information allowed by their role. - View their
own submitted activity records where appropriate.

**Platform administrator** - Manage users and organizations. - Manage
activity categories and emission factors. - View platform-level
operational information. - Review audit records. - Cannot silently alter
historical emission calculations.

### 2.2 Authorization requirements

-   Enforce authorization on the backend, not only by hiding frontend
    controls.
-   Every personal record must be scoped to its owner.
-   Every organization record must be scoped to the relevant
    organization.
-   A user must never access another organization's data by changing an
    ID in a URL or API request.
-   Use role checks and organization-membership checks for every
    protected operation.
-   Consider PostgreSQL Row-Level Security (RLS) as an additional
    database-level safeguard if it can be implemented and tested
    reliably. Do not treat RLS as a substitute for application
    authorization.
-   Never expose password hashes, JWT secrets, API keys, or private
    environment variables to the frontend.

------------------------------------------------------------------------

## 3. Core user journeys

### 3.1 Individual onboarding

1.  User opens CarbonIQ.
2.  User registers or signs in.
3.  User chooses or confirms **Personal** workspace.
4.  User sees a short onboarding explanation.
5.  User adds their first activity.
6.  CarbonIQ calculates and explains the resulting emissions.
7.  Dashboard displays the new total, category breakdown, and next
    useful action.

### 3.2 Organization onboarding

1.  User registers or signs in.
2.  User creates an organization or accepts membership.
3.  Organization owner adds departments and members.
4.  User selects the organization workspace.
5.  Authorized user records activities and assigns a department where
    applicable.
6.  Organization dashboard displays aggregated emissions and
    department-level breakdowns.

### 3.3 Record an activity

1.  User selects an activity category.
2.  User selects an activity type.
3.  UI displays the required quantity and unit.
4.  User enters quantity, date, and optional notes.
5.  Backend validates category, unit, date, workspace, and permissions.
6.  Backend selects an applicable emission factor based on activity
    type, geography, date, and factor validity.
7.  Backend calculates CO2e using deterministic code and stores the
    activity and emission record in one database transaction.
8.  UI displays the saved result and refreshes relevant summaries.

### 3.4 View insights

1.  User opens dashboard or Insights.
2.  Backend retrieves verified totals and trends from PostgreSQL.
3.  AI service receives only the minimum necessary aggregated data.
4.  AI returns a structured explanation and recommendations.
5.  UI displays recommendations with their rationale, category, and
    suggested action.
6.  User may mark a recommendation as helpful, dismissed, or completed.

------------------------------------------------------------------------

## 4. Functional requirements

### FR-01 Authentication and profile

-   Registration, login, logout, and current-user profile.
-   Hash passwords using bcrypt or Argon2.
-   Validate inputs on both frontend and backend.
-   Use secure JWT handling. Prefer httpOnly secure cookies where the
    local architecture supports them; otherwise document the chosen
    token storage and associated risks.
-   Provide clear validation and error messages.
-   Do not implement social login in the MVP unless specifically
    required.

### FR-02 Workspace selection

-   Support Personal and Organization workspaces.
-   A user can switch between workspaces they are authorized to access.
-   Make the active workspace obvious in the UI.
-   All dashboard queries and activity writes must respect the active
    workspace.

### FR-03 Organization and department management

-   Create and edit organizations.
-   Manage departments.
-   Add/remove members and assign roles.
-   Prevent duplicate membership records.
-   Restrict organization management to authorized roles.

### FR-04 Activity categories and activity entry

Initial categories: - Electricity - Transportation - Fuel - LPG /
cooking fuel - Waste

Potential activity types: - Electricity consumed (kWh) - Travel distance
by mode (km) - Petrol consumed (litres) - Diesel consumed (litres) - LPG
consumed (kg) - Waste generated by waste type (kg)

Requirements: - Store quantity as a numeric value with appropriate
precision. - Store the unit explicitly. - Validate quantity is positive
and within reasonable configured limits. - Store activity date and
optional description. - Support list, filter, pagination, edit, and
delete with appropriate permissions. - Editing or deleting an activity
must update or invalidate its associated emissions and summaries
consistently. - Keep a clear audit trail for important changes.

### FR-05 Emission factor management

An emission factor must be a traceable, versioned data record.

Minimum fields: - Activity type/category - Geography or region - Factor
value - Factor unit (e.g. kg CO2e per kWh) - Valid-from date - Valid-to
date (nullable) - Source name - Source URL or citation -
Publication/reference year - Notes and status

Requirements: - Do not hard-code factors throughout the application. -
Factors must be stored in PostgreSQL and managed through admin
functionality or seed data. - A factor must match the activity unit and
applicable geography. - If no valid factor exists, do not silently
guess. Show a clear message and prevent a misleading calculation. -
Preserve the factor value and factor-version reference used in each
emission record. - Updating a factor must not rewrite historical results
automatically. - Seed data must be clearly labelled as sample/demo data
unless sourced and verified.

### FR-06 Emission calculation

Core formula:

`emissions_kg_co2e = activity_quantity × emission_factor_kg_co2e_per_unit`

Where unit conversion is needed, convert to the factor's expected unit
before multiplication.

Requirements: - Calculations happen on the backend, never trust a
client-supplied emissions value. - Use deterministic code and
decimal-safe numeric handling. - Store the input quantity, unit, factor
reference/version, calculation timestamp, and result. - Keep rounding
rules consistent and documented. - Explain the calculation to users in a
simple way. - The formula is a simplified activity-based accounting
approach; the report must explain the selected boundary, exclusions, and
factor sources.

### FR-07 Dashboard and analytics

Personal dashboard: - Total emissions for selected period. - Change
versus previous comparable period. - Category-wise breakdown. - Trend
over time. - Recent activities. - Goal progress. - Recommended next
action.

Organization dashboard: - Total organizational emissions. - Trend by
month. - Department-wise comparison. - Category-wise breakdown. - Recent
organization activities. - Goal progress. - AI-assisted summary.

Requirements: - Provide sensible empty states for new users. - Allow
date-range filtering. - Avoid misleading comparisons when periods
differ. - Clearly label units and date ranges. - Do not show fabricated
values as real data.

### FR-08 Goals

-   Create personal or organization goals.
-   Define target amount or percentage reduction.
-   Define baseline period and target period.
-   Track progress using consistent calculation logic.
-   Show whether progress is on track, behind, or achieved based on
    explicit rules.
-   Do not imply a reduction target is scientifically validated unless
    its basis is documented.

### FR-09 AI insights and recommendations

-   AI is an advisory feature, not the source of truth for emissions.
-   Use verified database aggregates as AI input.
-   Generate recommendations based on category patterns, changes, and
    user/organization context.
-   Return structured JSON with title, explanation, suggested action,
    category, priority, and supporting metrics.
-   Validate the AI response against a schema before storing/displaying
    it.
-   Handle unavailable AI provider, rate limits, invalid output, and
    timeouts gracefully.
-   Provide a deterministic rule-based fallback so the application
    remains useful without an external AI API.
-   Do not send personal identifiers or unnecessary raw activity
    descriptions to the AI provider.
-   Clearly label generated content as AI-assisted.
-   Do not claim that an LLM recommendation is a verified scientific
    assessment.

### FR-10 Reports and exports

-   Filter by workspace and date range.
-   Show totals and category breakdown.
-   Export CSV in MVP.
-   PDF export can be added after core functionality.
-   Reports must use the same trusted calculation and aggregation logic
    as dashboards.
-   Store report metadata only if needed; do not store duplicate report
    data unnecessarily.

### FR-11 Audit and history

-   Record important create/update/delete operations.
-   Include actor, action, entity type, entity ID, timestamp, and safe
    change metadata.
-   Do not store passwords, tokens, or secrets in audit logs.
-   Preserve traceability of emission factor changes.

------------------------------------------------------------------------

## 5. Non-functional requirements

### Usability

-   A first-time user should understand how to record an activity
    without technical help.
-   Use plain language, helpful labels, examples, and contextual unit
    hints.
-   Keep common tasks reachable in a small number of steps.
-   Provide clear success, loading, empty, and error states.
-   Use consistent terminology throughout the app.

### Performance

-   Use pagination for activity history.
-   Add indexes for common filters and joins.
-   Avoid fetching all records for dashboard totals.
-   Use database aggregation for summaries.
-   Measure and optimize important queries using `EXPLAIN ANALYZE`.
-   Avoid premature caching; add it only if measurements justify it.

### Security

-   Hash passwords.
-   Validate and sanitize inputs.
-   Use parameterized SQL queries or a safe query builder/ORM.
-   Protect against SQL injection, XSS, CSRF where applicable, and
    insecure direct object references.
-   Apply rate limiting to authentication and AI endpoints.
-   Keep secrets in environment variables.
-   Provide `.env.example` without real credentials.
-   Restrict CORS to configured local frontend origins.
-   Do not commit secrets to Git.

### Reliability and data integrity

-   Use database constraints and foreign keys.
-   Use transactions for multi-step operations.
-   Ensure failed calculations do not leave partial records.
-   Define deletion behavior explicitly.
-   Handle duplicate requests where appropriate.
-   Use database migrations rather than relying on undocumented manual
    changes.

### Accessibility and responsive design

-   Responsive on desktop, tablet, and mobile.
-   Keyboard-accessible controls.
-   Visible focus states.
-   Adequate contrast.
-   Form labels and accessible validation.
-   Charts must include readable labels or text summaries.

------------------------------------------------------------------------

## 6. UI/UX design direction

The interface is a major product requirement. It must look polished and
feel simple, not like a generic admin template.

### 6.1 Visual direction

Create a modern sustainability-focused SaaS product: - Calm, confident,
clean, premium visual language. - Use a restrained forest-green /
emerald accent palette with warm off-white or neutral surfaces. - Use
dark charcoal for primary text. - Use green for positive sustainability
actions, not for every element. - Use amber/red sparingly for warnings
or high-emission indicators. - Use subtle borders, soft shadows,
generous spacing, and consistent corner radii. - Avoid excessive
gradients, glassmorphism, neon colors, clutter, and unnecessary
animations. - Use a consistent icon family such as Lucide. - Use
typography with excellent readability, such as Inter or a similar modern
sans-serif.

Suggested palette (can be refined): - Primary forest: `#176B4D` - Deep
forest: `#104B38` - Accent mint: `#DDF3E8` - Page background:
`#F7F9F7` - Surface: `#FFFFFF` - Main text: `#18231E` - Secondary text:
`#68756E` - Border: `#E4EAE5` - Warning: accessible amber - Error:
accessible red

### 6.2 Layout and navigation

Desktop: - Persistent left sidebar. - Top bar with page title, workspace
switcher, date range, notifications (if implemented), and profile
menu. - Main content with clear hierarchy and comfortable whitespace. -
Avoid overcrowding the dashboard with too many cards.

Suggested navigation: 1. Overview 2. Activities 3. Emissions 4. Insights
5. Goals 6. Reports 7. Organization (only for authorized organization
users) 8. Settings

Mobile: - Use a compact navigation pattern. - Make Add Activity
prominent. - Stack charts and cards vertically. - Ensure forms are
usable on small screens.

### 6.3 Required screens

**Public/auth** - Landing page (simple product explanation and CTA). -
Sign up. - Login. - Forgot password only if a complete reset flow is
implemented; otherwise omit.

**Onboarding** - Choose Personal or Organization workspace. - Create
organization flow. - Short explanation of how calculations work. - Do
not force users through a long questionnaire.

**Overview dashboard** - Greeting and active workspace. - Total CO2e
card with date range. - Period-over-period comparison. - Emissions trend
chart. - Category breakdown chart. - Recent activities. - Goal
progress. - One useful recommendation card. - Primary "Add activity"
action.

**Add activity** - Category selection with clear icons and
descriptions. - Dynamic fields based on activity type. - Unit displayed
beside quantity. - Date picker. - Optional notes. - Preview of
calculation only if factor is available and clearly labelled as an
estimate before saving. - Clear submit and cancel actions. - Explain why
a factor may be unavailable.

**Activity history** - Search/filter by category, date, workspace, and
department where authorized. - Table on desktop; cards or responsive
table on mobile. - Edit/delete controls based on permissions. - Show
quantity, unit, calculated kg CO2e, and date.

**Emissions analytics** - Trend chart with selectable period. - Category
breakdown. - Comparisons with prior period. - Clear units and
explanatory tooltips.

**AI insights** - Summary of important patterns. - Recommendations with
evidence/rationale. - Suggested actions. - Priority and category. -
Helpful/dismiss/complete feedback actions. - AI-generated label and
fallback state.

**Goals** - Goal list. - Create goal flow. - Progress visualization. -
Clear baseline and target period.

**Reports** - Date range and workspace filters. - Summary preview. - CSV
export.

**Organization** - Organization profile. - Members and roles. -
Departments. - Organization dashboard. - Department comparison.

**Admin** - Manage activity categories. - Manage emission factors and
sources. - View audit history. - Manage users/organizations at a basic
level.

### 6.4 UX rules

-   Always show the active workspace: Personal or a named Organization.
-   Never make the user understand database terminology.
-   Use "Carbon footprint" and "kg CO2e" in user-facing language with a
    short explanation.
-   Provide examples in activity forms.
-   Use progressive disclosure: show only fields relevant to the
    selected activity.
-   Use confirmation for destructive actions.
-   Show a clear explanation when a record cannot be calculated.
-   Empty states should explain what to do next and include an Add
    Activity CTA.
-   Do not use fake dashboard numbers or fake activity records in
    production mode.
-   Seed demo data only in an explicitly labelled demo environment.
-   Use realistic loading skeletons and useful error messages.
-   Charts must be legible, responsive, and not rely on color alone.

------------------------------------------------------------------------

## 7. Database architecture

Use **one PostgreSQL database** named `carboniq_db`, containing related
tables. Do not create a separate database for each module.

### 7.1 Proposed logical tables

The schema below is a starting design. Review and refine it during ERD
design; do not blindly create every table without checking cardinality
and constraints.

#### Identity and organization

1.  `users`
2.  `organizations`
3.  `organization_members`
4.  `departments`

#### Activity taxonomy and factors

5.  `activity_categories`
6.  `activity_types`
7.  `emission_factors`
8.  `emission_factor_sources` (optional if source metadata is normalized
    separately)

#### Activity and emissions

9.  `activities`
10. `emission_records`

#### Goals and AI

11. `goals`
12. `recommendations`
13. `recommendation_feedback` (optional)

#### Administration and reporting

14. `audit_logs`
15. `reports` (only if report history/metadata is needed)

### 7.2 Important modelling decisions

-   Use UUID or identity primary keys consistently; choose one strategy
    and document it.
-   Use `NUMERIC`/`DECIMAL` for quantities, factors, and emissions where
    decimal precision matters.
-   Store timestamps consistently, preferably timezone-aware.
-   Define ownership clearly. Activities should belong either to a
    personal user workspace or an organization workspace, never
    ambiguously to both.
-   Consider explicit workspace ownership columns and database
    constraints to enforce valid combinations.
-   Organization activities may reference a department; personal
    activities should not.
-   Use foreign keys and appropriate `ON DELETE` behavior.
-   Prefer soft deletion only where audit/history requirements justify
    it; do not add `deleted_at` to every table automatically.
-   Store units explicitly and validate compatible units.
-   Store factor source, region, validity dates, and factor version.
-   Store the factor snapshot/value used in an emission record so
    historical results remain reproducible.
-   Add uniqueness constraints for email, membership pairs, and relevant
    factor-version combinations.
-   Add checks for positive activity quantities and valid date ranges.
-   Index common filters such as owner/workspace, activity date,
    category, organization, and foreign keys. Confirm index choices with
    query plans.

### 7.3 Transaction design

Creating an activity and its emission record must be atomic:

1.  Validate authenticated user and workspace permission.
2.  Validate activity type, unit, quantity, and date.
3.  Select an applicable emission factor.
4.  Begin transaction.
5.  Insert activity.
6.  Calculate CO2e using backend decimal-safe logic.
7.  Insert emission record with factor snapshot/reference.
8.  Insert audit record if applicable.
9.  Commit.
10. On any failure, rollback.

Do not rely on frontend calculations or separate non-atomic API calls
for this workflow.

### 7.4 Advanced database requirements

Implement and document these with actual demonstrations:

**Normalization** - Explain 1NF, 2NF, and 3NF where applicable. - Avoid
storing repeating category/factor/source data in activity rows. -
Explain any intentional denormalization used for performance.

**Transactions and ACID** - Atomic activity + emission creation. -
Atomic activity edit/delete and associated emission recalculation. -
Demonstrate rollback on an induced failure. - Explain consistency,
isolation, and durability.

**Concurrency** - Test simultaneous activity submissions. - Use suitable
transaction isolation and row locking only where needed. - Prevent
duplicate or inconsistent summary updates. - Document the test scenario
and observed outcome.

**Stored procedures/functions** - Implement at least one meaningful
PostgreSQL function/procedure, such as a reusable emission calculation
or summary operation, if it improves the database design. - Keep
business logic ownership clear: avoid maintaining two conflicting
calculation implementations in SQL and Node. - If calculation is in
backend code, use database procedures for other meaningful database
tasks.

**Triggers** - Use triggers for audit logging or carefully selected
derived-state maintenance. - Avoid hidden, overly complex triggers that
make application behavior hard to understand. - Document each trigger
and test it.

**Views** - Monthly emissions summary. - Category-wise emissions
summary. - Organization/department summary where appropriate.

**Indexes and query optimization** - Index high-use filter and join
columns. - Demonstrate a before/after query plan where a useful index
improves a measured query. - Use `EXPLAIN (ANALYZE, BUFFERS)` where
suitable. - Do not claim performance improvement without measurements.

**Integrity** - Primary keys, foreign keys, unique constraints, check
constraints, and not-null constraints. - Test invalid data and show that
the database rejects it.

### 7.5 Data provenance

Emission factors must have documented sources. For each factor,
record: - Publisher/organization. - Source title. - URL or reference. -
Publication year. - Geography. - Unit. - Validity period. - Date
retrieved/entered.

Do not invent authoritative factor values or cite a source that has not
been checked. During development, clearly label illustrative seed values
as sample data. Before final demonstration/report, verify the chosen
factors and explain their scope and limitations.

------------------------------------------------------------------------

## 8. AI service design

### 8.1 Architecture

Node/Express remains the main application backend. A separate Python
FastAPI service may provide AI/analytics functionality.

Flow: 1. Frontend requests insights from Express. 2. Express verifies
the user and workspace permissions. 3. Express obtains aggregated
metrics from PostgreSQL. 4. Express sends minimal, non-identifying
structured metrics to AI service. 5. AI service generates structured
recommendations. 6. Express validates and stores the result if
appropriate. 7. Frontend displays it.

The AI service must not connect directly to the database in the initial
architecture. Keep database access centralized through the main backend.

### 8.2 AI input example

``` json
{
  "period": "2026-10",
  "workspace_type": "individual",
  "total_emissions_kg_co2e": 420.0,
  "previous_period_emissions_kg_co2e": 350.0,
  "category_totals": [
    {"category": "electricity", "kg_co2e": 250.0},
    {"category": "transport", "kg_co2e": 120.0},
    {"category": "waste", "kg_co2e": 50.0}
  ]
}
```

All figures must be calculated by CarbonIQ. Example values above are
illustrative only.

### 8.3 Structured AI output

``` json
{
  "summary": "Your recorded emissions increased compared with the previous period.",
  "recommendations": [
    {
      "title": "Review electricity usage",
      "category": "electricity",
      "priority": "medium",
      "reason": "Electricity is the largest recorded category in this period.",
      "action": "Review high-consumption appliances and consider practical efficiency improvements.",
      "supporting_metric": "250 kg CO2e"
    }
  ],
  "disclaimer": "Recommendations are informational and depend on the completeness and accuracy of recorded activities."
}
```

### 8.4 AI provider strategy

-   Keep provider integration behind a service interface.
-   Read API keys only from environment variables.
-   Do not commit API keys.
-   Implement timeout, retry limits, and graceful fallback.
-   If no API key is configured, use a local rule-based recommendation
    engine.
-   Do not make the app unusable when the AI service is offline.
-   Do not send user names, email addresses, or raw sensitive notes to
    the AI provider.
-   Make AI use explicit in the UI.

------------------------------------------------------------------------

## 9. Suggested API structure

Use REST APIs under `/api/v1`.

### Authentication

-   `POST /api/v1/auth/register`
-   `POST /api/v1/auth/login`
-   `POST /api/v1/auth/logout`
-   `GET /api/v1/auth/me`

### Workspaces and organizations

-   `GET /api/v1/workspaces`
-   `POST /api/v1/organizations`
-   `GET /api/v1/organizations/:organizationId`
-   `PATCH /api/v1/organizations/:organizationId`
-   `GET /api/v1/organizations/:organizationId/members`
-   `POST /api/v1/organizations/:organizationId/members`
-   `GET /api/v1/organizations/:organizationId/departments`
-   `POST /api/v1/organizations/:organizationId/departments`

### Activities

-   `GET /api/v1/activities`
-   `POST /api/v1/activities`
-   `GET /api/v1/activities/:activityId`
-   `PATCH /api/v1/activities/:activityId`
-   `DELETE /api/v1/activities/:activityId`

### Emissions and analytics

-   `GET /api/v1/emissions/summary`
-   `GET /api/v1/emissions/trends`
-   `GET /api/v1/emissions/breakdown`
-   `GET /api/v1/emissions/departments`

### Categories and factors

-   `GET /api/v1/activity-categories`
-   `GET /api/v1/activity-types`
-   `GET /api/v1/emission-factors`
-   `POST /api/v1/admin/emission-factors`
-   `PATCH /api/v1/admin/emission-factors/:factorId`

### Goals and recommendations

-   `GET /api/v1/goals`
-   `POST /api/v1/goals`
-   `PATCH /api/v1/goals/:goalId`
-   `GET /api/v1/recommendations`
-   `POST /api/v1/recommendations/refresh`
-   `POST /api/v1/recommendations/:recommendationId/feedback`

### Reports and administration

-   `GET /api/v1/reports/summary`
-   `GET /api/v1/reports/export.csv`
-   `GET /api/v1/admin/audit-logs`

All endpoints must validate authentication, authorization, inputs, and
workspace scope. Use pagination and consistent error response formats.

------------------------------------------------------------------------

## 10. Repository and project structure

Use a monorepo so both team members can work in one repository.

``` text
CarbonIQ/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   ├── dashboard/
│   │   │   ├── activities/
│   │   │   ├── emissions/
│   │   │   ├── organizations/
│   │   │   ├── goals/
│   │   │   ├── insights/
│   │   │   └── reports/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── services/
│   │   └── styles/
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── modules/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── validators/
│   │   └── app.js
│   └── package.json
│
├── ai-service/
│   ├── app/
│   │   ├── main.py
│   │   ├── schemas/
│   │   ├── services/
│   │   └── providers/
│   └── requirements.txt
│
├── database/
│   ├── migrations/
│   ├── seeds/
│   ├── functions/
│   ├── procedures/
│   ├── triggers/
│   ├── views/
│   └── README.md
│
├── docs/
│   ├── architecture/
│   ├── api/
│   └── decisions/
│
├── tests/
├── .env.example
├── .gitignore
├── README.md
└── PLAN.md
```

The exact structure can be adapted to the framework version and tooling
chosen. Keep modules cohesive and avoid creating empty folders without a
purpose.

------------------------------------------------------------------------

## 11. Local development setup

### Prerequisites

-   Git
-   Node.js LTS
-   npm
-   PostgreSQL
-   pgAdmin (optional but recommended for visual database
    administration)
-   Python 3.11 or a compatible supported version for the AI service
-   VS Code or another IDE
-   Postman or equivalent API client

### Local services

-   Frontend: `http://localhost:5173` (if using Vite; adapt if framework
    differs)
-   Backend: `http://localhost:5000`
-   AI service: `http://localhost:8000`
-   PostgreSQL: local default port `5432`

Use environment variables for ports and connection strings. Do not
assume these ports are free.

### Required developer experience

Provide clear setup instructions: 1. Clone repository. 2. Install
frontend dependencies. 3. Install backend dependencies. 4. Create local
PostgreSQL database. 5. Configure `.env`. 6. Run database migrations. 7.
Seed sample data. 8. Start backend, frontend, and AI service. 9. Run
tests.

Provide scripts such as `dev`, `build`, `test`, `lint`, and
migration/seed commands where practical.

------------------------------------------------------------------------

## 12. Testing strategy and acceptance criteria

### Authentication

-   A user can register and log in.
-   Invalid credentials are rejected.
-   Passwords are never stored in plain text.
-   Unauthorized requests are rejected.

### Workspace security

-   Individual users cannot access another user's personal records.
-   Organization members cannot access unrelated organizations.
-   Organization permissions are checked server-side.

### Activity and calculations

-   Valid activities are saved.
-   Invalid quantities and incompatible units are rejected.
-   Correct factor selection is applied.
-   Calculation result is reproducible.
-   Factor provenance is visible or retrievable.
-   Updating an activity updates associated emissions consistently.
-   A failed multi-step operation rolls back.

### Dashboard

-   Totals match the underlying emission records.
-   Date filters work.
-   Category breakdown sums to the displayed total, subject to
    documented rounding.
-   Empty states work for new users.
-   Demo data is clearly identified.

### ADBMS demonstrations

1.  **Referential integrity:** attempt an invalid foreign key insert and
    show rejection.
2.  **Check constraints:** attempt a negative quantity and show
    rejection.
3.  **Transaction rollback:** induce failure between activity and
    emission insertion and show no partial record remains.
4.  **Concurrency:** submit simultaneous valid activity operations and
    verify no lost records or inconsistent totals.
5.  **Trigger:** demonstrate an audit record created by a relevant
    database change.
6.  **View:** query monthly and category summaries.
7.  **Index:** compare a representative query plan before and after a
    justified index.
8.  **Stored procedure/function:** execute and test the chosen database
    routine.

### AI

-   AI receives correct aggregate data.
-   Invalid AI output is rejected.
-   AI outage triggers fallback.
-   Recommendations are linked to actual metrics and are clearly
    labelled AI-assisted.
-   No sensitive identifiers are sent unnecessarily.

### UI/UX

-   Main flows work on desktop and mobile widths.
-   Forms provide useful validation.
-   Loading, error, success, and empty states exist.
-   Navigation and workspace selection are understandable.
-   No dead buttons or placeholder interactions remain.

------------------------------------------------------------------------

## 13. Development phases and deliverables

### Phase 0 --- Repository and requirements

Deliverables: - Repository initialized. - README and environment
example. - Functional requirements agreed. - Architecture decisions
documented.

### Phase 1 --- Database design

Deliverables: - ER diagram. - Data dictionary. - Normalized relational
schema. - Migration scripts. - Seed scripts. - Constraints and indexes.

### Phase 2 --- Database implementation

Deliverables: - Working PostgreSQL schema. - Emission factor seed data
with provenance. - Transactions. - Views. - Trigger(s). - Stored
function/procedure. - Database tests and ADBMS demonstration scripts.

### Phase 3 --- Backend

Deliverables: - Authentication. - Workspace and organization APIs. -
Activity APIs. - Deterministic emission calculation. - Analytics APIs. -
Goals and reports APIs. - Authorization tests.

### Phase 4 --- Frontend

Deliverables: - Polished responsive UI. - Authentication and
onboarding. - Workspace switcher. - Dashboards. - Activity
entry/history. - Analytics, goals, reports, and organization pages. -
Accessible loading/error/empty states.

### Phase 5 --- AI

Deliverables: - AI service. - Rule-based fallback. - Structured AI
recommendations. - Insight history/feedback if included. - Privacy and
error handling.

### Phase 6 --- Integration and quality

Deliverables: - End-to-end workflows. - Security and permission
checks. - Concurrency and rollback demonstrations. - Query-plan
evidence. - Bug fixes. - Local setup verified from a clean clone.

### Phase 7 --- Deployment

Only after local acceptance: - Choose hosting. - Configure production
database. - Configure secrets. - Configure HTTPS and CORS. - Apply
migrations. - Seed only appropriate production reference data. - Verify
backups and operational logs.

------------------------------------------------------------------------

## 14. Two-person team division

The team should split ownership but review each other's work.

**Member A --- Database and backend lead** - ERD and schema. -
Normalization and data dictionary. - PostgreSQL migrations and seed
data. - Transactions, functions, triggers, views, indexes. - Backend
APIs and authorization. - Database testing and query optimization.

**Member B --- Frontend and AI lead** - UI design system and responsive
React frontend. - Onboarding and dashboards. - Activity forms and
analytics visualizations. - Python AI service and recommendation
interface. - Frontend integration and UI testing.

**Shared** - Requirements and architecture decisions. - API contracts. -
Emission-factor source verification. - End-to-end testing. - Git reviews
and conflict resolution. - Demo preparation and understanding of all
ADBMS concepts.

Both members must be able to explain the database design, calculation
flow, transaction behavior, and AI boundary during evaluation.

------------------------------------------------------------------------

## 15. Project risks and mitigations

  -----------------------------------------------------------------------
  Risk                                Mitigation
  ----------------------------------- -----------------------------------
  Unverified emission factors         Record source, geography, year,
                                      unit, and validity; label sample
                                      data

  Wrong factor/unit matching          Validate units and factor
                                      applicability before calculation

  Historical values changing          Store factor snapshot/version with
                                      each emission record

  Partial database writes             Use transactions and rollback

  Cross-organization data leakage     Server-side authorization and
                                      scoped queries; test IDOR cases

  AI unavailable or costly            Rule-based fallback; make AI
                                      optional

  AI hallucination                    Give AI only computed metrics;
                                      validate structured output; label
                                      insights

  Scope becomes too large             Deliver MVP first; defer non-goals

  Poor UI usability                   Test core flows with another
                                      person; simplify forms and
                                      navigation

  Last-minute integration failures    Integrate continuously and maintain
                                      a working main branch
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 16. MVP scope and prioritization

### Must-have

-   Registration/login.
-   Individual workspace.
-   Organization creation and membership.
-   Activity categories and activity recording.
-   Emission factors with source metadata.
-   Deterministic CO2e calculation.
-   Activity and emission history.
-   Personal and organization dashboards.
-   Monthly/category analytics.
-   Goals.
-   AI-assisted insights with rule-based fallback.
-   Core ADBMS features.
-   CSV export.
-   Authorization and validation.

### Should-have

-   Department-level analytics.
-   Recommendation feedback.
-   PDF reports.
-   More activity types.
-   Better admin management screens.
-   PostgreSQL RLS if feasible and tested.

### Could-have

-   Email invitations.
-   Scheduled reports.
-   Data import templates.
-   More advanced anomaly detection.
-   Additional languages.
-   External AI provider selection.

### Out of scope for MVP

-   IoT integrations.
-   Carbon offset marketplace.
-   Regulatory certification.
-   Native mobile app.
-   Custom-trained ML model.

------------------------------------------------------------------------

## 17. Definition of done

A feature is not complete merely because its page exists.

A feature is complete only when: - UI is usable and responsive. - API is
implemented and validated. - Database persistence works. - Authorization
is enforced. - Success and failure states are handled. - Relevant tests
pass. - No placeholder buttons or fake production data remain. - Setup
and behavior are documented where necessary.

The project is ready for final demonstration when: 1. A new individual
can register, record activities, and see calculated emissions. 2. An
organization can be created, members/departments managed, and
organizational activities recorded. 3. Personal and organization data
remain isolated. 4. Dashboards and reports match database calculations.
5. AI insights work or gracefully fall back. 6. The required ADBMS
demonstrations can be executed and explained. 7. The project can be
started locally from the documented instructions.

------------------------------------------------------------------------

## 18. Instructions for AI coding agents

When using this document with an AI coding agent:

1.  Read this entire document before modifying the repository.
2.  Inspect the existing repository and environment before making
    assumptions.
3.  Do not generate the entire application in one uncontrolled pass.
4.  Work phase by phase, beginning with repository inspection and
    architecture confirmation.
5.  Maintain a `PLAN.md` or task checklist and update it as work is
    completed.
6.  Create and maintain database migrations; do not rely on manual-only
    database changes.
7.  Keep code modular, typed where practical, readable, and secure.
8.  Do not invent emission-factor values or sources. Use clearly
    labelled sample data until sources are verified.
9.  Do not fabricate dashboard metrics, AI insights, test results, or
    completion status.
10. Use real backend APIs and database persistence; do not leave
    mock-only interactions in completed flows.
11. Test each feature before moving on.
12. Preserve working functionality when adding new features.
13. If a requirement is ambiguous, make a conservative documented
    decision or ask before a destructive change.
14. Keep secrets out of source control.
15. At the end of each phase, report files changed, commands run, tests
    passed/failed, known issues, and the next phase.
16. Do not start report/PPT generation until the working application is
    complete; keep technical notes that will help prepare them later.

------------------------------------------------------------------------

## 19. First implementation sprint

The first sprint must not attempt to build every feature.

### Sprint 1 tasks

1.  Inspect local tools and repository state.
2.  Initialize the CarbonIQ monorepo.
3.  Create frontend, backend, AI-service, database, and docs
    scaffolding.
4.  Add `.gitignore`, `.env.example`, and root README.
5.  Decide exact framework versions based on installed/current stable
    compatible tooling.
6.  Create PostgreSQL database setup instructions.
7.  Produce the first ER diagram and data dictionary.
8.  Review workspace ownership and organization-membership model.
9.  Create initial database migrations for identity, organizations,
    activity taxonomy, factors, activities, and emission records.
10. Seed clearly labelled sample categories and factors.
11. Test migrations and core constraints.
12. Do not begin full dashboard implementation until the data model is
    reviewed.

### Sprint 1 exit criteria

-   Repository starts cleanly.
-   Database can be created from documented steps.
-   Migrations run successfully from an empty database.
-   Core relationships and constraints are tested.
-   ERD and data dictionary match the implemented schema.
-   No secrets or unverified authoritative emission factors are
    committed.

------------------------------------------------------------------------

## 20. Final product standard

CarbonIQ should feel like a thoughtfully designed sustainability
product, not a classroom CRUD demo.

A successful result combines: - **Ease of use:** clear language, guided
activity entry, useful defaults, and uncluttered screens. - **Visual
quality:** polished responsive dashboard, consistent design system,
clear charts, and purposeful visual hierarchy. - **Technical quality:**
reliable relational schema, secure APIs, deterministic calculations,
traceable factors, and meaningful ADBMS features. - **Trust:**
transparent calculations, source provenance, historical reproducibility,
and honest AI limitations.

**Build the simplest complete and reliable version first. Then improve
the experience and add advanced features without compromising data
integrity.**
