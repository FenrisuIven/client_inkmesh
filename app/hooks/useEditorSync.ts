'use client';

import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { calculateDiff } from '../lib/diff';
import { API_BASE_URL, SyncPayload, SessionInitResponse } from '../lib/types';

export function useEditorSync(docId: string) {
  const [content, setContent] = useState('');
  const [isReady, setIsReady] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const lastSyncedContentRef = useRef<string>('');
  const currentContentRef = useRef<string>('');
  const syncInProgressRef = useRef(false);

  const getUserId = () => {
    if (typeof window === 'undefined') return 'server-side';
    let userId = sessionStorage.getItem('inkmesh_userId');
    if (!userId) {
      userId = uuidv4();
      sessionStorage.setItem('inkmesh_userId', userId);
    }
    return userId;
  };

  useEffect(() => {
    if (!docId) return;

    async function initSession() {
      try {
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };

        const response = await fetch(`${API_BASE_URL}/document/${docId}/session/init`, {
          method: 'POST',
          headers,
          credentials: 'include',
        });

        console.log({ response });

        if (!response.ok) throw new Error('Failed to init session');
        
        const data: SessionInitResponse = await response.json();
        
        setSessionId(data.sessionId);
        setContent(data.content);
        lastSyncedContentRef.current = data.content;
        currentContentRef.current = data.content;
        setIsReady(true);
        console.log('Session initialized:', data.sessionId);
      } catch (err) {
        console.error('Initialization error:', err);

        setIsReady(true); 
      }
    }

    initSession();
  }, [docId]);

  useEffect(() => {
    if (!isReady || !sessionId || !docId) return;

    const intervalId = setInterval(async () => {
      if (syncInProgressRef.current) return;

      const lastSyncedContentAtStart = lastSyncedContentRef.current;
      const currentContentAtStart = currentContentRef.current;
      const hasChanges = currentContentAtStart !== lastSyncedContentAtStart;

      let payload: SyncPayload;
      if (hasChanges) {
        const diff = calculateDiff(lastSyncedContentAtStart, currentContentAtStart);
        payload = {
          sessionId,
          userId: getUserId(),
          startIndex: diff.startIndex,
          endIndex: diff.endIndex,
          content: diff.content,
          changeType: 'update',
        };
      } else {
        payload = {
          sessionId,
          userId: getUserId(),
          startIndex: 0,
          endIndex: 0,
          content: '',
          changeType: 'ping',
        };
      }

      syncInProgressRef.current = true;

      try {
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };

        const response = await fetch(`${API_BASE_URL}/document/${docId}/sync`, {
          method: 'POST',
          headers,
          credentials: 'include',
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const data = await response.json();
          const serverContent = data.serverContent;

          if (serverContent !== undefined) {
            const latestLocalContent = currentContentRef.current;
            const diffDuringRequest = calculateDiff(currentContentAtStart, latestLocalContent);
            
            const merged = serverContent.substring(0, diffDuringRequest.startIndex) + 
                           diffDuringRequest.content + 
                           serverContent.substring(diffDuringRequest.endIndex);
            
            if (currentContentRef.current !== merged) {
              setContent(merged);
              currentContentRef.current = merged;
            }
            lastSyncedContentRef.current = serverContent;
          }
        }
      } catch (err) {
        console.error('Network error during sync:', err);
      } finally {
        syncInProgressRef.current = false;
      }
    }, 2000);

    return () => clearInterval(intervalId);
  }, [isReady, sessionId, docId]);

  const handleContentChange = (newContent: string, _delta: any, source?: string) => {
    if (source === 'api') return;
    setContent(newContent);
    currentContentRef.current = newContent;
  };

  return {
    content,
    handleContentChange,
    isReady,
    sessionId
  };
}
