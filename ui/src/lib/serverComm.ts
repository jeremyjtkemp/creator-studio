import { getAuth } from 'firebase/auth';
import { app } from './firebase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'APIError';
  }
}

async function getAuthToken(): Promise<string | null> {
  const auth = getAuth(app);
  const user = auth.currentUser;
  if (!user) {
    return null;
  }
  return user.getIdToken();
}

async function fetchWithAuth(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getAuthToken();
  const headers = new Headers(options.headers);
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new APIError(
      response.status,
      `API request failed: ${response.statusText}`
    );
  }

  return response;
}

// Type definitions for hook generation
export interface GeneratedHook {
  text: string;
  category: 'curiosity' | 'controversial' | 'pov' | 'emotional' | 'statistical';
  estimatedEngagement: string;
  viralityScore: 'high' | 'medium' | 'low';
  variations: number;
}

// Type definitions for demo script generation
export interface GenerateDemoScriptsRequest {
  projectName: string;
  projectDescription: string;
  category: string;
  tone: string;
  count?: number;
}

export interface GenerateDemoScriptsResponse {
  scripts: string[];
  generated: number;
  category: string;
  tone: string;
  timestamp: string;
  success: boolean;
}

export interface GenerateHooksRequest {
  appDescription: string;
  projectName?: string;
  hookCount?: number;
}

export interface GenerateHooksResponse {
  hooks: GeneratedHook[];
  generated: number;
  timestamp: string;
  success: boolean;
  error?: string;
  details?: string;
}

// API endpoints
export async function getCurrentUser() {
  const response = await fetchWithAuth('/api/v1/protected/me');
  return response.json();
}

export async function generateHooks(data: GenerateHooksRequest): Promise<GenerateHooksResponse> {
  const response = await fetchWithAuth('/api/v1/protected/hooks/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function generateDemoScripts(data: GenerateDemoScriptsRequest): Promise<GenerateDemoScriptsResponse> {
  const response = await fetchWithAuth('/api/v1/protected/demo-scripts/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return response.json();
}

// Example of how to add more API endpoints:
// export async function createChat(data: CreateChatData) {
//   const response = await fetchWithAuth('/api/v1/protected/chats', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify(data),
//   });
//   return response.json();
// }

export const api = {
  getCurrentUser,
  generateHooks,
  generateDemoScripts,
  // Add other API endpoints here
}; 