/**
 * CarbonIQ Centralized Frontend API Service Client
 */

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/$/, '');

class ApiService {
  constructor() {
    this.token = localStorage.getItem('carboniq_token');
    this.workspace = JSON.parse(localStorage.getItem('carboniq_workspace') || 'null');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('carboniq_token', token);
    } else {
      localStorage.removeItem('carboniq_token');
    }
  }

  setWorkspace(workspace) {
    this.workspace = workspace;
    if (workspace) {
      localStorage.setItem('carboniq_workspace', JSON.stringify(workspace));
    } else {
      localStorage.removeItem('carboniq_workspace');
    }
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    if (this.workspace) {
      headers['x-workspace-type'] = this.workspace.type;
      if (this.workspace.type === 'organization' && this.workspace.id) {
        headers['x-organization-id'] = this.workspace.id;
      }
    }

    const config = {
      method: options.method || 'GET',
      headers,
    };

    if (options.body) {
      config.body = JSON.stringify(options.body);
    }

    const response = await fetch(url, config);
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const error = new Error(data?.error?.message || `API Error: ${response.status}`);
      error.status = response.status;
      error.code = data?.error?.code || 'API_ERROR';
      error.details = data?.error?.details || null;
      throw error;
    }

    return data;
  }

  // --- Auth Endpoints ---
  async login(email, password) {
    const res = await this.request('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    this.setToken(res.data.token);
    return res.data;
  }

  async register(fullName, email, password, defaultWorkspaceType = 'personal') {
    const res = await this.request('/auth/register', {
      method: 'POST',
      body: { fullName, email, password, defaultWorkspaceType },
    });
    this.setToken(res.data.token);
    return res.data;
  }

  async getMe() {
    return this.request('/auth/me');
  }

  async updateMe(data) {
    return this.request('/auth/me', {
      method: 'PATCH',
      body: data,
    });
  }

  logout() {
    this.setToken(null);
    this.setWorkspace(null);
  }

  // --- Workspaces & Organizations ---
  async getWorkspaces() {
    return this.request('/workspaces');
  }

  async createOrganization(data) {
    return this.request('/organizations', {
      method: 'POST',
      body: data,
    });
  }

  async getOrganization(id) {
    return this.request(`/organizations/${id}`);
  }

  async getOrgMembers(id) {
    return this.request(`/organizations/${id}/members`);
  }

  async addOrgMember(orgId, email, role = 'member') {
    return this.request(`/organizations/${orgId}/members`, {
      method: 'POST',
      body: { email, role },
    });
  }

  async getOrgDepartments(id) {
    return this.request(`/organizations/${id}/departments`);
  }

  async createOrgDepartment(orgId, data) {
    return this.request(`/organizations/${orgId}/departments`, {
      method: 'POST',
      body: data,
    });
  }

  // --- Taxonomy & Factors ---
  async getCategories() {
    return this.request('/taxonomy/categories');
  }

  async getActivityTypes(categoryCode) {
    const query = categoryCode ? `?category_code=${categoryCode}` : '';
    return this.request(`/taxonomy/types${query}`);
  }

  async getEmissionFactors(activityTypeId) {
    const query = activityTypeId ? `?activity_type_id=${activityTypeId}` : '';
    return this.request(`/taxonomy/factors${query}`);
  }

  // --- Activities ---
  async listActivities(params = {}) {
    const searchParams = new URLSearchParams(params).toString();
    const query = searchParams ? `?${searchParams}` : '';
    return this.request(`/activities${query}`);
  }

  async getActivity(id) {
    return this.request(`/activities/${id}`);
  }

  async createActivity(data) {
    return this.request('/activities', {
      method: 'POST',
      body: data,
    });
  }

  async updateActivity(id, data) {
    return this.request(`/activities/${id}`, {
      method: 'PATCH',
      body: data,
    });
  }

  async deleteActivity(id) {
    return this.request(`/activities/${id}`, {
      method: 'DELETE',
    });
  }

  // --- Emissions Analytics ---
  async previewCalculation(data) {
    return this.request('/emissions/preview', {
      method: 'POST',
      body: data,
    });
  }

  async getSummary(startDate, endDate) {
    let query = '';
    if (startDate && endDate) {
      query = `?startDate=${startDate}&endDate=${endDate}`;
    }
    return this.request(`/emissions/summary${query}`);
  }

  async getTrends(limit = 12) {
    return this.request(`/emissions/trends?limit=${limit}`);
  }

  async getBreakdown() {
    return this.request('/emissions/breakdown');
  }

  async getDepartmentBreakdown() {
    return this.request('/emissions/departments');
  }

  // --- Goals ---
  async listGoals() {
    return this.request('/goals');
  }

  async createGoal(data) {
    return this.request('/goals', {
      method: 'POST',
      body: data,
    });
  }

  async updateGoalStatus(id, status) {
    return this.request(`/goals/${id}/status`, {
      method: 'PATCH',
      body: { status },
    });
  }

  // --- Recommendations ---
  async listRecommendations() {
    return this.request('/recommendations');
  }

  async refreshRecommendations() {
    return this.request('/recommendations/refresh', {
      method: 'POST',
    });
  }

  async updateRecommendationStatus(id, status) {
    return this.request(`/recommendations/${id}/status`, {
      method: 'PATCH',
      body: { status },
    });
  }
}

export const api = new ApiService();
export default api;

