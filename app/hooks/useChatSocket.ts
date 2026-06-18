'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_BASE_URL, CHAT_EVENTS, MessageDto } from '../lib/types';

export function useChatSocket(projectId: string) {
  const [messages, setMessages] = useState<MessageDto[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!projectId) return;

    // Connect to the chat-rooms namespace
    const socket = io(`${API_BASE_URL}/chat-rooms`, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to chat socket');
      setIsConnected(true);
      setError(null);
      socket.emit(CHAT_EVENTS.JOIN, { projectId });
    });

    socket.on(CHAT_EVENTS.HISTORY, (history: MessageDto[]) => {
      setMessages(history);
    });

    socket.on(CHAT_EVENTS.MESSAGE, (message: MessageDto) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on(CHAT_EVENTS.ERROR, (err: { message: string }) => {
      console.error('Chat socket error:', err);
      setError(err.message);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from chat socket');
      setIsConnected(false);
    });

    return () => {
      socket.disconnect();
    };
  }, [projectId]);

  const sendMessage = useCallback((content: string) => {
    if (socketRef.current?.connected && content.trim()) {
      socketRef.current.emit(CHAT_EVENTS.MESSAGE, {
        projectId,
        content: content.trim(),
      });
    }
  }, [projectId]);

  return {
    messages,
    isConnected,
    error,
    sendMessage,
  };
}
