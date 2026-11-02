# CarbonIQ Backend REST API Reference

Base URL: `http://localhost:5000/api/v1`

---

## 1. Authentication (`/api/v1/auth`)

### `POST /api/v1/auth/register`
Creates a new user profile with bcrypt password hashing and issues a JWT token.
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "Password@123",
    "fullName": "Jane Doe",
    "defaultWorkspaceType": "personal"
  }
  ```
- **Response:** `201 Created`
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "uuid",
        "email": "user@example.com",
        "full_name": "Jane Doe",
        "system_role": "user",
        "default_workspace_type": "personal",
        "created_at": "timestamp"
      },
      "token": "jwt_token_string"
    }
  }
  ```

### `POST /api/v1/auth/login`
Authenticates email and password.
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "Password@123"
  }
  ```
- **Response:** `200 OK`

### `GET /api/v1/auth/me`
Retrieves authenticated user profile.
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `200 OK`

---

## 2. Workspaces (`/api/v1/workspaces`)

### `GET /api/v1/workspaces`
Returns the personal workspace and all organizations the authenticated user belongs to.
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `200 OK`
  ```json
  {
    "success": true,
    "data": {
      "personal": {
        "type": "personal",
        "id": "uuid",
        "name": "Jane Doe's Personal Workspace",
        "isDefault": true
      },
      "organizations": [
        {
          "type": "organization",
          "id": "uuid",
          "name": "EcoTech Innovations",
          "memberRole": "owner",
          "totalMembers": 2,
          "totalDepartments": 3
        }
      ]
    }
  }
  ```

---

## 3. Organizations (`/api/v1/organizations`)

### `POST /api/v1/organizations`
Creates a new organization. The creator is automatically registered as `owner` in `organization_members`.
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "name": "Solaris Clean Energy",
    "industry": "Renewables",
    "country": "India"
  }
  ```

### `GET /api/v1/organizations/:id`
Returns organization profile, member role of caller, and departments.

### `POST /api/v1/organizations/:id/departments`
Creates a department within an organization (Requires owner/admin role).

### `POST /api/v1/organizations/:id/members`
Adds a member by email and assigns role (`owner`, `admin`, `member`).

---

## 4. Taxonomy & Factors (`/api/v1/taxonomy`)

### `GET /api/v1/taxonomy/categories`
Lists active emission categories (`electricity`, `transportation`, `fuel`, `lpg`, `waste`).

### `GET /api/v1/taxonomy/types`
Lists activity types with units (`kWh`, `km`, `litres`, `kg`). Filterable by `?category_code=electricity`.

### `GET /api/v1/taxonomy/factors`
Lists verified emission factors with official citations (CEA, UK DEFRA, US EPA).

---

## 5. Activities & Emissions (`/api/v1/activities`)

**Multi-Tenant Workspace Header Rule:**
All activity and emission endpoints require workspace scoping:
- Personal Workspace: `x-workspace-type: personal`
- Organization Workspace: `x-workspace-type: organization` AND `x-organization-id: <uuid>`

### `POST /api/v1/activities`
Creates an activity and calculates emissions atomically in a PostgreSQL transaction.
- **Headers:** `Authorization: Bearer <token>`, `x-workspace-type: personal`
- **Request Body:**
  ```json
  {
    "activityTypeId": "33333333-3333-3333-3333-333333333301",
    "quantity": 150.0,
    "unit": "kWh",
    "activityDate": "2026-10-20",
    "notes": "Home electricity bill"
  }
  ```
- **Response:** `201 Created`
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "quantity": "150.0000",
      "unit": "kWh",
      "emissionRecord": {
        "calculated_co2e_kg": "107.4000",
        "emission_factor_snapshot": "0.716000",
        "factor_source_snapshot": "CEA India 2023"
      }
    }
  }
  ```

### `GET /api/v1/activities`
Returns paginated activities with detailed taxonomy and emissions.
- **Query Parameters:** `page`, `limit`, `startDate`, `endDate`, `categoryCode`, `departmentId`.

### `PATCH /api/v1/activities/:id`
Updates activity parameters and deterministically recalculates emissions within a transaction.

### `DELETE /api/v1/activities/:id`
Deletes activity; automatically cascades to delete the associated emission record.

---

## 6. Analytics & Summaries (`/api/v1/emissions`)

### `POST /api/v1/emissions/preview`
Computes estimated CO2e in real time before submission.
- **Request Body:**
  ```json
  {
    "activityTypeId": "33333333-3333-3333-3333-333333333301",
    "quantity": 100.0,
    "unit": "kWh"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "estimatedCo2eKg": 71.6,
      "factorValue": 0.716,
      "sourceName": "CEA India 2023"
    }
  }
  ```

### `GET /api/v1/emissions/summary`
Calls `fn_get_workspace_summary` function comparing current period vs prior period.

### `GET /api/v1/emissions/trends`
Returns monthly aggregation from view `v_monthly_emissions`.

### `GET /api/v1/emissions/breakdown`
Returns categorical aggregation and percentage share from view `v_category_emissions`.

### `GET /api/v1/emissions/departments`
Returns departmental totals from view `v_department_emissions` for organization workspace.

---

## 7. Goals (`/api/v1/goals`)

### `GET /api/v1/goals`
Lists workspace reduction goals with real-time progress percentage against actual recorded emissions.

### `POST /api/v1/goals`
Creates a target reduction goal.

---

## 8. Recommendations (`/api/v1/recommendations`)

### `GET /api/v1/recommendations`
Lists active recommendations sorted by priority.

### `POST /api/v1/recommendations/refresh`
Refreshes recommendations based on the highest emitting categories in the active workspace.

### `PATCH /api/v1/recommendations/:id/status`
Updates recommendation status to `'completed'` or `'dismissed'`.
