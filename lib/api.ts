import { API_BASE_URL } from "@/app/lib/types";

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network response was not ok' }));
    throw new Error(error.message || response.statusText);
  }

  return response.json();
}

export async function getMyProjects() {
  return fetchAPI('/projects/me');
}

export async function createProject(data: { name: string }) {
  return fetchAPI('/projects', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function createDocument(data: { projectId: string; name: string }) {
  return fetchAPI('/document', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
