/**
 * VoiceAI Platform — API Client
 * Typed fetch wrapper for the FastAPI backend.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("voiceai_token");
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== "undefined") {
      localStorage.setItem("voiceai_token", token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("voiceai_token");
    }
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: "Request failed" }));
      throw new Error(error.detail || `HTTP ${res.status}`);
    }

    if (res.status === 204) return {} as T;
    return res.json();
  }

  // Auth
  async register(data: { email: string; password: string; full_name: string; company_name?: string }) {
    return this.request<{ access_token: string; user: any }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async login(email: string, password: string) {
    return this.request<{ access_token: string; user: any }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async getProfile() {
    return this.request<any>("/auth/me");
  }

  // Agents
  async getAgents() {
    return this.request<any[]>("/agents");
  }

  async createAgent(data: any) {
    return this.request<any>("/agents", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateAgent(id: string, data: any) {
    return this.request<any>(`/agents/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteAgent(id: string) {
    return this.request<void>(`/agents/${id}`, { method: "DELETE" });
  }

  // Calls
  async getCalls(params?: { agent_id?: string; status?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<any[]>(`/calls${query ? `?${query}` : ""}`);
  }

  async initiateCall(data: { agent_id: string; phone_number?: string }) {
    return this.request<any>("/calls", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getCall(id: string) {
    return this.request<any>(`/calls/${id}`);
  }

  async getTranscript(callId: string) {
    return this.request<any>(`/calls/${callId}/transcript`);
  }

  // Workflows
  async getWorkflows() {
    return this.request<any[]>("/workflows");
  }

  async createWorkflow(data: any) {
    return this.request<any>("/workflows", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateWorkflow(id: string, data: any) {
    return this.request<any>(`/workflows/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteWorkflow(id: string) {
    return this.request<void>(`/workflows/${id}`, { method: "DELETE" });
  }

  async executeWorkflow(id: string, data: { input_text: string; variables?: any }) {
    return this.request<any>(`/workflows/${id}/execute`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Knowledge Base
  async getKnowledgeBases() {
    return this.request<any[]>("/knowledge");
  }

  async createKnowledgeBase(data: { name: string; description?: string }) {
    return this.request<any>("/knowledge", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Analytics
  async getOverview() {
    return this.request<any>("/analytics/overview");
  }

  async getCallAnalytics(days: number = 30) {
    return this.request<any>(`/analytics/calls?days=${days}`);
  }

  // API Keys
  async getApiKeys() {
    return this.request<any[]>("/developer/api-keys");
  }

  async createApiKey(data: { name: string; permissions?: string[] }) {
    return this.request<any>("/developer/api-keys", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async deleteApiKey(id: string) {
    return this.request<void>(`/developer/api-keys/${id}`, { method: "DELETE" });
  }

  // Chat (demo)
  async chat(message: string, model: string = "gpt-4o-mini") {
    return this.request<{ response: string; tokens: number }>("/chat", {
      method: "POST",
      body: JSON.stringify({ message, model }),
    });
  }
}

export const api = new ApiClient();
export default api;
