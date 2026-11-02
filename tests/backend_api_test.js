/**
 * CarbonIQ Automated Backend API Test Suite
 * Tests authentication, authorization, workspace data isolation,
 * atomic activity CRUD, deterministic calculations, and analytics endpoints.
 */

const app = require('../backend/src/app');
const db = require('../backend/src/config/db');

let server;
let baseUrl;

let authTokenUser1;
let user1Id;
let authTokenUser2;
let user2Id;
let createdOrgId;
let createdDeptId;
let createdActivityId;
let gridElectricityTypeId;

let totalTests = 0;
let passedTests = 0;

async function assert(name, conditionFn) {
  totalTests++;
  process.stdout.write(`[TEST ${totalTests}] ${name} ... `);
  try {
    await conditionFn();
    console.log('PASSED \u2714');
    passedTests++;
  } catch (err) {
    console.log('FAILED \u2718');
    console.error(`       Failure Details:`, err.message);
  }
}

async function api(path, options = {}) {
  const url = `${baseUrl}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  const config = {
    method: options.method || 'GET',
    headers,
  };
  if (options.body) {
    config.body = JSON.stringify(options.body);
  }
  const res = await fetch(url, config);
  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

async function runTests() {
  console.log('==============================================================================');
  console.log('STARTING CARBONIQ BACKEND API AUTOMATED TEST SUITE');
  console.log('==============================================================================');

  // Start app on ephemeral port
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      console.log(`[Test Server] Running on ${baseUrl}\n`);
      resolve();
    });
  });

  // 1. Health check
  await assert('Health Check Endpoint (GET /health)', async () => {
    const res = await api('/health');
    if (res.status !== 200 || res.data.status !== 'healthy') {
      throw new Error(`Expected 200 healthy, got ${res.status}`);
    }
  });

  // 2. Taxonomy endpoints
  await assert('Taxonomy Categories (GET /api/v1/taxonomy/categories)', async () => {
    const res = await api('/api/v1/taxonomy/categories');
    if (res.status !== 200 || !res.data.success || res.data.data.length < 5) {
      throw new Error(`Expected at least 5 categories, got ${res.data?.data?.length}`);
    }
  });

  await assert('Taxonomy Activity Types (GET /api/v1/taxonomy/types)', async () => {
    const res = await api('/api/v1/taxonomy/types');
    if (res.status !== 200 || !res.data.success || res.data.data.length < 10) {
      throw new Error(`Expected at least 10 types, got ${res.data?.data?.length}`);
    }
    const gridType = res.data.data.find((t) => t.code === 'grid_electricity');
    if (!gridType) throw new Error('Grid electricity activity type not found');
    gridElectricityTypeId = gridType.id;
  });

  // 3. User Registration
  const testEmail1 = `alice.test.${Date.now()}@carboniq.local`;
  const testEmail2 = `bob.test.${Date.now()}@carboniq.local`;

  await assert('User Registration (POST /api/v1/auth/register)', async () => {
    const res = await api('/api/v1/auth/register', {
      method: 'POST',
      body: {
        email: testEmail1,
        password: 'Password@123',
        fullName: 'Alice Test Architect',
        defaultWorkspaceType: 'personal',
      },
    });
    if (res.status !== 201 || !res.data.success || !res.data.data.token) {
      throw new Error(`Registration failed: ${JSON.stringify(res.data)}`);
    }
    authTokenUser1 = res.data.data.token;
    user1Id = res.data.data.user.id;
  });

  await assert('Duplicate Email Rejection (POST /api/v1/auth/register)', async () => {
    const res = await api('/api/v1/auth/register', {
      method: 'POST',
      body: {
        email: testEmail1,
        password: 'Password@123',
        fullName: 'Alice Duplicate',
      },
    });
    if (res.status !== 409 || res.data.error.code !== 'EMAIL_ALREADY_EXISTS') {
      throw new Error(`Expected 409 EMAIL_ALREADY_EXISTS, got ${res.status}`);
    }
  });

  // 4. User Login
  await assert('User Login Success (POST /api/v1/auth/login)', async () => {
    const res = await api('/api/v1/auth/login', {
      method: 'POST',
      body: {
        email: testEmail1,
        password: 'Password@123',
      },
    });
    if (res.status !== 200 || !res.data.data.token) {
      throw new Error(`Login failed: ${JSON.stringify(res.data)}`);
    }
  });

  await assert('User Login Invalid Password (POST /api/v1/auth/login)', async () => {
    const res = await api('/api/v1/auth/login', {
      method: 'POST',
      body: {
        email: testEmail1,
        password: 'WrongPassword!',
      },
    });
    if (res.status !== 401) {
      throw new Error(`Expected 401 for wrong password, got ${res.status}`);
    }
  });

  await assert('Get Authenticated Profile (GET /api/v1/auth/me)', async () => {
    const res = await api('/api/v1/auth/me', {
      headers: { Authorization: `Bearer ${authTokenUser1}` },
    });
    if (res.status !== 200 || res.data.data.email !== testEmail1) {
      throw new Error(`Profile email mismatch: ${JSON.stringify(res.data)}`);
    }
  });

  // Register second user for isolation testing
  const regUser2 = await api('/api/v1/auth/register', {
    method: 'POST',
    body: {
      email: testEmail2,
      password: 'Password@123',
      fullName: 'Bob Isolation Tester',
      defaultWorkspaceType: 'personal',
    },
  });
  authTokenUser2 = regUser2.data.data.token;
  user2Id = regUser2.data.data.user.id;

  // 5. Workspaces Discovery
  await assert('Workspace Discovery (GET /api/v1/workspaces)', async () => {
    const res = await api('/api/v1/workspaces', {
      headers: { Authorization: `Bearer ${authTokenUser1}` },
    });
    if (res.status !== 200 || !res.data.data.personal) {
      throw new Error(`Invalid workspaces response: ${JSON.stringify(res.data)}`);
    }
  });

  // 6. Organization Creation & Scoping
  await assert('Organization Creation (POST /api/v1/organizations)', async () => {
    const res = await api('/api/v1/organizations', {
      method: 'POST',
      headers: { Authorization: `Bearer ${authTokenUser1}` },
      body: {
        name: 'GreenTech Innovations Lab',
        description: 'Sustainable software solutions testing lab',
        industry: 'CleanTech',
      },
    });
    if (res.status !== 201 || !res.data.data.id) {
      throw new Error(`Org creation failed: ${JSON.stringify(res.data)}`);
    }
    createdOrgId = res.data.data.id;
  });

  await assert('Department Creation (POST /api/v1/organizations/:id/departments)', async () => {
    const res = await api(`/api/v1/organizations/${createdOrgId}/departments`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authTokenUser1}` },
      body: {
        name: 'Data Center Energy Optimization',
        code: 'DC-ENG',
      },
    });
    if (res.status !== 201 || !res.data.data.id) {
      throw new Error(`Dept creation failed: ${JSON.stringify(res.data)}`);
    }
    createdDeptId = res.data.data.id;
  });

  // 7. Workspace Data Isolation Test: User 2 attempts to query User 1's organization
  await assert('Workspace Scoping Security (Non-member Access Denied 403)', async () => {
    const res = await api('/api/v1/activities', {
      headers: {
        Authorization: `Bearer ${authTokenUser2}`,
        'x-workspace-type': 'organization',
        'x-organization-id': createdOrgId,
      },
    });
    if (res.status !== 403 || res.data.error.code !== 'WORKSPACE_ACCESS_DENIED') {
      throw new Error(`Expected 403 WORKSPACE_ACCESS_DENIED, got ${res.status}`);
    }
  });

  // 8. Deterministic Calculation Preview
  await assert('Emissions Live Calculation Preview (POST /api/v1/emissions/preview)', async () => {
    const res = await api('/api/v1/emissions/preview', {
      method: 'POST',
      headers: { Authorization: `Bearer ${authTokenUser1}` },
      body: {
        activityTypeId: gridElectricityTypeId,
        quantity: 100.0,
        unit: 'kWh',
        geography: 'India',
      },
    });
    if (res.status !== 200 || res.data.data.estimatedCo2eKg !== 71.6) {
      throw new Error(`Expected 71.6 kg CO2e for 100 kWh @ 0.716, got ${res.data?.data?.estimatedCo2eKg}`);
    }
  });

  // 9. Atomic Activity Creation with Frozen Factor Snapshot
  await assert('Atomic Activity & Emission Record Creation (POST /api/v1/activities)', async () => {
    const res = await api('/api/v1/activities', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authTokenUser1}`,
        'x-workspace-type': 'personal',
      },
      body: {
        activityTypeId: gridElectricityTypeId,
        quantity: 100.0,
        unit: 'kWh',
        activityDate: '2026-10-15',
        notes: 'Monthly data center workstation power',
      },
    });
    if (res.status !== 201 || !res.data.data.id) {
      throw new Error(`Activity creation failed: ${JSON.stringify(res.data)}`);
    }
    createdActivityId = res.data.data.id;
    const emRec = res.data.data.emissionRecord;
    if (!emRec || parseFloat(emRec.calculated_co2e_kg) !== 71.6) {
      throw new Error(`Emission record mismatch: ${JSON.stringify(emRec)}`);
    }
  });

  // 10. Constraint Violation Test: Negative Quantity Rejection
  await assert('Database Check Constraint: Negative Quantity Rejection (400)', async () => {
    const res = await api('/api/v1/activities', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authTokenUser1}`,
        'x-workspace-type': 'personal',
      },
      body: {
        activityTypeId: gridElectricityTypeId,
        quantity: -50.0,
        unit: 'kWh',
        activityDate: '2026-10-15',
      },
    });
    if (res.status !== 400) {
      throw new Error(`Expected 400 for negative quantity, got ${res.status}`);
    }
  });

  // 11. Activity History Listing
  await assert('List Workspace Activities (GET /api/v1/activities)', async () => {
    const res = await api('/api/v1/activities', {
      headers: {
        Authorization: `Bearer ${authTokenUser1}`,
        'x-workspace-type': 'personal',
      },
    });
    if (res.status !== 200 || !res.data.data || res.data.data.length < 1) {
      throw new Error(`Expected at least 1 activity in history, got ${res.data?.data?.length}`);
    }
  });

  // 12. Activity Detail
  await assert('Get Activity Detail (GET /api/v1/activities/:id)', async () => {
    const res = await api(`/api/v1/activities/${createdActivityId}`, {
      headers: {
        Authorization: `Bearer ${authTokenUser1}`,
        'x-workspace-type': 'personal',
      },
    });
    if (res.status !== 200 || res.data.data.activity_id !== createdActivityId) {
      throw new Error(`Detail mismatch: ${JSON.stringify(res.data)}`);
    }
  });

  // 13. Activity Update & Atomic Recalculation
  await assert('Activity Update & Emission Recalculation (PATCH /api/v1/activities/:id)', async () => {
    const res = await api(`/api/v1/activities/${createdActivityId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${authTokenUser1}`,
        'x-workspace-type': 'personal',
      },
      body: {
        quantity: 200.0, // Double quantity -> Should recalculate to 143.2 kg CO2e
      },
    });
    if (res.status !== 200 || parseFloat(res.data.data.calculated_co2e_kg) !== 143.2) {
      throw new Error(`Recalculation mismatch: ${JSON.stringify(res.data)}`);
    }
  });

  // 14. Emissions Analytics Summary
  await assert('Emissions Summary Analytics (GET /api/v1/emissions/summary)', async () => {
    const res = await api('/api/v1/emissions/summary?startDate=2026-10-01&endDate=2026-10-31', {
      headers: {
        Authorization: `Bearer ${authTokenUser1}`,
        'x-workspace-type': 'personal',
      },
    });
    if (res.status !== 200 || res.data.data.currentPeriod.totalCo2eKg < 140) {
      throw new Error(`Summary mismatch: ${JSON.stringify(res.data)}`);
    }
  });

  // 15. Emissions Trends View
  await assert('Emissions Monthly Trends (GET /api/v1/emissions/trends)', async () => {
    const res = await api('/api/v1/emissions/trends', {
      headers: {
        Authorization: `Bearer ${authTokenUser1}`,
        'x-workspace-type': 'personal',
      },
    });
    if (res.status !== 200 || !Array.isArray(res.data.data)) {
      throw new Error(`Trends mismatch: ${JSON.stringify(res.data)}`);
    }
  });

  // 16. Emissions Category Breakdown View
  await assert('Emissions Category Breakdown (GET /api/v1/emissions/breakdown)', async () => {
    const res = await api('/api/v1/emissions/breakdown', {
      headers: {
        Authorization: `Bearer ${authTokenUser1}`,
        'x-workspace-type': 'personal',
      },
    });
    if (res.status !== 200 || res.data.data.length === 0) {
      throw new Error(`Breakdown mismatch: ${JSON.stringify(res.data)}`);
    }
  });

  // 17. Goals Management
  await assert('Create Carbon Reduction Goal (POST /api/v1/goals)', async () => {
    const res = await api('/api/v1/goals', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authTokenUser1}`,
        'x-workspace-type': 'personal',
      },
      body: {
        title: 'Cut electricity emissions by 20%',
        baselineCo2eKg: 200.0,
        targetCo2eKg: 160.0,
        targetReductionPct: 20.0,
        startDate: '2026-10-01',
        targetDate: '2026-12-31',
      },
    });
    if (res.status !== 201 || !res.data.data.id) {
      throw new Error(`Goal creation failed: ${JSON.stringify(res.data)}`);
    }
  });

  await assert('List Goals with Live Progress (GET /api/v1/goals)', async () => {
    const res = await api('/api/v1/goals', {
      headers: {
        Authorization: `Bearer ${authTokenUser1}`,
        'x-workspace-type': 'personal',
      },
    });
    if (res.status !== 200 || res.data.data.length === 0) {
      throw new Error(`Goal listing failed: ${JSON.stringify(res.data)}`);
    }
  });

  // 18. Recommendations & Refresh
  await assert('Refresh & List Recommendations (POST /api/v1/recommendations/refresh)', async () => {
    const refreshRes = await api('/api/v1/recommendations/refresh', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authTokenUser1}`,
        'x-workspace-type': 'personal',
      },
    });
    if (refreshRes.status !== 200) {
      throw new Error(`Rec refresh failed: ${JSON.stringify(refreshRes.data)}`);
    }

    const listRes = await api('/api/v1/recommendations', {
      headers: {
        Authorization: `Bearer ${authTokenUser1}`,
        'x-workspace-type': 'personal',
      },
    });
    if (listRes.status !== 200 || listRes.data.data.length === 0) {
      throw new Error(`Rec listing failed: ${JSON.stringify(listRes.data)}`);
    }
  });

  // 19. Activity Deletion & Cascade Clean-up
  await assert('Delete Activity with Cascaded Emission Record (DELETE /api/v1/activities/:id)', async () => {
    const res = await api(`/api/v1/activities/${createdActivityId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${authTokenUser1}`,
        'x-workspace-type': 'personal',
      },
    });
    if (res.status !== 200) {
      throw new Error(`Deletion failed: ${JSON.stringify(res.data)}`);
    }
    // Verify it is gone
    const getRes = await api(`/api/v1/activities/${createdActivityId}`, {
      headers: {
        Authorization: `Bearer ${authTokenUser1}`,
        'x-workspace-type': 'personal',
      },
    });
    if (getRes.status !== 404) {
      throw new Error(`Expected 404 after deletion, got ${getRes.status}`);
    }
  });

  console.log('\n==============================================================================');
  console.log(`TEST SUMMARY: ${passedTests} / ${totalTests} TESTS PASSED`);
  console.log('==============================================================================\n');

  // Teardown test server and db pool
  server.close();
  await db.pool.end();

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('[Fatal Test Failure]:', err);
  if (server) server.close();
  process.exit(1);
});
