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

export async function getProjectDocuments(projectId: string) {
  return fetchAPI(`/document/project/${projectId}`);
}

export async function getAllUsers() {
  return fetchAPI('/users/all');
}

export async function getProjectMembers(projectId: string) {
  return fetchAPI(`/projects/${projectId}/members`);
}

export async function addProjectMember(projectId: string, memberId: string, role: string) {
  return fetchAPI(`/projects/${projectId}/members`, {
    method: 'POST',
    body: JSON.stringify({ memberId, role }),
  });
}

export async function getProjectCharacters(projectId: string) {
  return fetchAPI(`/projects/${projectId}/characters`);
}

export async function linkCharacter(projectId: string, characterId: string) {
  return fetchAPI(`/projects/${projectId}/characters`, {
    method: 'POST',
    body: JSON.stringify({ characterId }),
  });
}

export async function unlinkCharacter(projectId: string, characterId: string) {
  return fetchAPI(`/projects/${projectId}/characters/${characterId}`, {
    method: 'DELETE',
  });
}

export async function getAvailableCharacters(projectId: string) {
  return fetchAPI(`/characters/available/projects/${projectId}`);
}

export async function getProjectsByCharacter(characterId: string) {
  return fetchAPI(`/projects/character/${characterId}`);
}
