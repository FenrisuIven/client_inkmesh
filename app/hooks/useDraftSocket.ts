'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import Delta from 'quill-delta';
import Quill from 'quill'; 
import { API_BASE_URL, DRAFT_EVENTS, DraftUpdatePayload } from '../lib/types';
import { v4 as uuidv4 } from 'uuid';

// Helper for Delta to HTML conversion
const deltaToHtml = (delta: Delta): string => {
  const tempQuill = new Quill(document.createElement('div'));
  tempQuill.setContents(delta);
  return tempQuill.root.innerHTML;
};

export function useDraftSocket(projectId: string) {
  const [content, setContent] = useState<string>(''); // Now stores HTML string
  const [isReady, setIsReady] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  
  const currentDeltaRef = useRef<Delta>(new Delta());
  const userIdRef = useRef<string>('');

  useEffect(() => {
    let userId = sessionStorage.getItem('inkmesh_userId');
    if (!userId) {
      userId = uuidv4();
      sessionStorage.setItem('inkmesh_userId', userId);
    }
    userIdRef.current = userId;
  }, []);

  useEffect(() => {
    if (!projectId) return;

    // Connect to the drafts namespace
    const socket = io(`${API_BASE_URL}/drafts`, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to drafts socket');
      socket.emit(DRAFT_EVENTS.JOIN, { projectId });
    });

    socket.on(DRAFT_EVENTS.INITIAL_STATE, (data: { content: any }) => {
      // Content could be received as Delta or HTML string initially
      const delta = typeof data.content === 'string' ? new Delta([{insert: data.content}]) : new Delta(data.content);
      currentDeltaRef.current = delta;
      setContent(deltaToHtml(delta)); // Convert to HTML
      setIsReady(true);
    });

    socket.on(DRAFT_EVENTS.UPDATE, (payload: DraftUpdatePayload) => {
      if (payload.userId === userIdRef.current) return;

      const incomingDelta = new Delta(payload.delta);
      currentDeltaRef.current = currentDeltaRef.current.compose(incomingDelta);
      
      setContent(deltaToHtml(currentDeltaRef.current)); // Convert to HTML
    });

    socket.on('error', (err: any) => {
      console.error('Draft socket error:', err);
      setIsReady(true); 
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from drafts socket');
    });

    return () => {
      socket.disconnect();
    };
  }, [projectId]);

  const handleContentChange = useCallback((newContent: any, delta: Delta, source: string) => {
    if (source !== 'user') return;

    currentDeltaRef.current = currentDeltaRef.current.compose(delta);
    setContent(newContent); // newContent is HTML string from ReactQuill

    if (socketRef.current?.connected) {
      const payload: DraftUpdatePayload = {
        projectId,
        delta: delta.ops,
        userId: userIdRef.current,
      };
      socketRef.current.emit(DRAFT_EVENTS.UPDATE, payload);
    }
  }, [projectId]);

  return {
    content,
    handleContentChange,
    isReady,
  };
}
