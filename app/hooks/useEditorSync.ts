'use client';

import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { calculateDiff } from '../lib/diff';
import { DOC_ID, API_BASE_URL, SyncPayload, SessionInitResponse } from '../lib/types';

export function useEditorSync() {
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
    async function initSession() {
      try {
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };

        const response = await fetch(`${API_BASE_URL}/document/${DOC_ID}/session/init`, {
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
  }, []);

  // 2. The 5-second sync interval
  useEffect(() => {
    if (!isReady || !sessionId) return;

    const intervalId = setInterval(async () => {
      // Skip if a sync is already in progress or no changes
      if (syncInProgressRef.current) return;
      if (currentContentRef.current === lastSyncedContentRef.current) return;

      const currentContent = currentContentRef.current;
      const lastSyncedContent = lastSyncedContentRef.current;

      const diff = calculateDiff(lastSyncedContent, currentContent);
      
      const payload: SyncPayload = {
        sessionId,
        userId: getUserId(),
        startIndex: diff.startIndex,
        endIndex: diff.endIndex,
        content: diff.content,
        changeType: 'update',
      };

      syncInProgressRef.current = true;
      console.log('Attempting sync...', payload);

      try {
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };

        // Endpoint structure: /document/:docId/sync (placeholder per requirements)
        const response = await fetch(`${API_BASE_URL}/document/${DOC_ID}/sync`, {
          method: 'POST',
          headers,
          credentials: 'include',
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          lastSyncedContentRef.current = currentContent;
          console.log('Sync successful');
        } else {
          console.error('Sync failed with status:', response.status);
          // Changes remain in currentContentRef, will be included in next cycle
        }
      } catch (err) {
        console.error('Network error during sync:', err);
      } finally {
        syncInProgressRef.current = false;
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [isReady, sessionId]);

  // Handler for Quill changes
  const handleContentChange = (newContent: string) => {
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
