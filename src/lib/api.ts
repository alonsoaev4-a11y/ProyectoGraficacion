// ============================================================
// api.ts — Integración con backend FastAPI (soft_evolved DB)
// ============================================================

const BASE_URL = '/api';

function getToken(): string | null {
  return localStorage.getItem('herman_token');
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 401) {
    localStorage.removeItem('herman_token');
    localStorage.removeItem('herman_user');
    window.location.href = '/login';
    throw new Error('No autorizado');
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `Error ${res.status}` }));
    throw new Error(err.detail || `Error ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, { headers: authHeaders() });
  return handleResponse<T>(res);
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: authHeaders(),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return handleResponse<T>(res);
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  return handleResponse<T>(res);
}

export async function apiDelete(path: string): Promise<void> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return handleResponse<void>(res);
}

// ── Auth ─────────────────────────────────────────────────
export interface AuthUser {
  id: number;
  email: string;
  name: string;
  avatar_url?: string | null;
}

export interface TokenResponse {
  access_token: string;
  user: AuthUser;
}

export const authApi = {
  login: (email: string, password: string) =>
    apiPost<TokenResponse>('/auth/login', { email, password }),

  register: (email: string, password: string, name: string) =>
    apiPost<TokenResponse>('/auth/register', { email, password, name }),

  me: () => apiGet<AuthUser>('/auth/me'),
};

// ── Projects ─────────────────────────────────────────────
export interface Project {
  id: number;
  name: string;
  description?: string;
  owner_id: number;
  status: 'active' | 'archived' | 'deleted';
  settings?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export const projectsApi = {
  list: () => apiGet<Project[]>('/projects'),
  get: (id: number) => apiGet<Project>(`/projects/${id}`),
  create: (data: { name: string; description?: string; settings?: unknown }) =>
    apiPost<Project>('/projects', data),
  update: (id: number, data: Partial<Project>) =>
    apiPut<Project>(`/projects/${id}`, data),
  delete: (id: number) => apiDelete(`/projects/${id}`),
};

// ── Requirements ────────────────────────────────────────
export interface Requirement {
  id: number;
  project_id: number;
  title: string;
  description?: string;
  type: string;
  priority: string;
  status: string;
  acceptance_criteria?: unknown;
  created_at: string;
  updated_at: string;
}

export const requirementsApi = {
  list: (projectId: number) => apiGet<Requirement[]>(`/projects/${projectId}/requirements`),
  create: (projectId: number, data: Partial<Requirement>) =>
    apiPost<Requirement>(`/projects/${projectId}/requirements`, data),
  update: (id: number, data: Partial<Requirement>) =>
    apiPut<Requirement>(`/requirements/${id}`, data),
  delete: (id: number) => apiDelete(`/requirements/${id}`),
};

// ── Use Cases ───────────────────────────────────────────
export interface UseCase {
  id: number;
  project_id: number;
  title: string;
  description?: string;
  actor?: string;
  preconditions?: unknown;
  postconditions?: unknown;
  created_at: string;
  updated_at: string;
}

export const useCasesApi = {
  list: (projectId: number) => apiGet<UseCase[]>(`/projects/${projectId}/use-cases`),
  get: (id: number) => apiGet<UseCase>(`/use-cases/${id}`),
  create: (projectId: number, data: Partial<UseCase>) =>
    apiPost<UseCase>(`/projects/${projectId}/use-cases`, data),
  update: (id: number, data: Partial<UseCase>) =>
    apiPut<UseCase>(`/use-cases/${id}`, data),
  delete: (id: number) => apiDelete(`/use-cases/${id}`),
};

// ── Audit ───────────────────────────────────────────────
export interface AuditLog {
  id: number;
  project_id: number;
  user_id?: number;
  action: string;
  description?: string;
  entity?: string;
  type: string;
  status: string;
  created_at: string;
}

export const auditApi = {
  list: (projectId: number) => apiGet<AuditLog[]>(`/projects/${projectId}/audit`),
};

// ── Metadatos ───────────────────────────────────────────────
export interface MetadataLog {
  id: number;
  project_id: number;
  data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export const metadataApi = {
  get: (projectId: number) => apiGet<MetadataLog | null>(`/projects/${projectId}/metadatos`),
  upsert: (projectId: number, data: any) =>
    apiPut<MetadataLog>(`/projects/${projectId}/metadatos`, { data }),
};
