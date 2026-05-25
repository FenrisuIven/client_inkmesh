'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { calculateDiff } from '../lib/diff';
import { API_BASE_URL, DRAFT_EVENTS, DraftUpdatePayload } from '../lib/types';
import { v4 as uuidv4 } from 'uuid';

export function useDraftSocket(projectId: string) {
  const [content, setContent] = useState('');
  const [isReady, setIsReady] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  
  const lastSyncedContentRef = useRef<string>('');
  const currentContentRef = useRef<string>('');
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

    socket.on(DRAFT_EVENTS.INITIAL_STATE, (data: { content: string }) => {
      setContent(data.content);
      lastSyncedContentRef.current = data.content;
      currentContentRef.current = data.content;
      setIsReady(true);
    });

    socket.on(DRAFT_EVENTS.UPDATE, (payload: DraftUpdatePayload) => {
      if (payload.userId === userIdRef.current) return;

      const currentContent = currentContentRef.current;
      const updatedContent =
        currentContent.substring(0, payload.startIndex) +
        payload.content +
        currentContent.substring(payload.endIndex);

      setContent(updatedContent);
      currentContentRef.current = updatedContent;
      lastSyncedContentRef.current = updatedContent; // In WebSockets, we treat external updates as truth
    });

    socket.on('error', (err: any) => {
      console.error('Draft socket error:', err);
      setIsReady(true); // Stop the loader on error so user can see something happened
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from drafts socket');
    });

    return () => {
      socket.disconnect();
    };
  }, [projectId]);

  const handleContentChange = useCallback((newContent: string) => {
    if (newContent === currentContentRef.current) return;

    const oldContent = currentContentRef.current;
    currentContentRef.current = newContent;
    setContent(newContent);

    if (socketRef.current?.connected) {
      const diff = calculateDiff(oldContent, newContent);
      const payload: DraftUpdatePayload = {
        projectId,
        startIndex: diff.startIndex,
        endIndex: diff.endIndex,
        content: diff.content,
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
