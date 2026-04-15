export interface SyncPayload {
  sessionId: string;
  userId: string;
  startIndex: number;
  endIndex: number;
  content: string;
  changeType: 'update' | 'insert' | 'delete';
}

export interface SessionInitResponse {
  sessionId: string;
  content: string;
}

export const DOC_ID = '550e8400-e29b-41d4-a716-446655440000';
export const API_BASE_URL = 'http://localhost:4001';
