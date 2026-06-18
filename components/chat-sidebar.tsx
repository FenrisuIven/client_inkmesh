'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useChatSocket } from '@/app/hooks/useChatSocket';
import { useAuth } from '@/hooks/use-auth';
import { getProjectMembers, getArchivedChatRooms, deleteArchivedChatRoom } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { RiSendPlane2Line, RiArchiveLine, RiChat3Line, RiCloseLine, RiDeleteBinLine } from '@remixicon/react';
import { ChatRoomDto } from '@/app/lib/types';

interface ChatSidebarProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ChatSidebar({ projectId, isOpen, onClose }: ChatSidebarProps) {
  const { messages, sendMessage, isConnected, error } = useChatSocket(projectId);
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'chat' | 'archives'>('chat');
  const [input, setInput] = useState('');
  const [role, setRole] = useState<string | null>(null);
  const [archivedRooms, setArchivedRooms] = useState<ChatRoomDto[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchRole() {
      try {
        const members = await getProjectMembers(projectId);
        const me = members.find((m: any) => m.auth0_id === user?.auth0Id);
        if (me) setRole(me.role);
      } catch (err) {
        console.error('Failed to fetch project role:', err);
      }
    }
    if (user && projectId) fetchRole();
  }, [user, projectId]);

  useEffect(() => {
    if (activeTab === 'archives' && role === 'OWNER') {
      fetchArchives();
    }
  }, [activeTab, role]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchArchives = async () => {
    try {
      const rooms = await getArchivedChatRooms(projectId);
      setArchivedRooms(rooms);
    } catch (err) {
      console.error('Failed to fetch archived rooms:', err);
    }
  };

  const handleDeleteArchive = async (roomId: string) => {
    try {
      await deleteArchivedChatRoom(projectId, roomId);
      setArchivedRooms((prev) => prev.filter((r) => r.id !== roomId));
    } catch (err) {
      console.error('Failed to delete archived room:', err);
    }
  };

  const handleSend = () => {
    if (input.trim()) {
      sendMessage(input);
      setInput('');
    }
  };

  if (!isOpen) return null;

  const isOwner = role === 'OWNER';

  return (
    <div className="w-80 border-l bg-background flex flex-col h-full shadow-xl transition-all duration-300 ease-in-out">
      <Card className="border-none rounded-none flex flex-col h-full">
        <CardHeader className="p-4 flex flex-row items-center justify-between border-b space-y-0">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <RiChat3Line className="w-5 h-5" />
            Discussion
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <RiCloseLine className="w-5 h-5" />
          </Button>
        </CardHeader>

        {isOwner && (
          <div className="flex p-1 bg-muted/50 gap-1">
            <Button
              variant={activeTab === 'chat' ? 'secondary' : 'ghost'}
              className="flex-1 text-xs h-8"
              onClick={() => setActiveTab('chat')}
            >
              Live Chat
            </Button>
            <Button
              variant={activeTab === 'archives' ? 'secondary' : 'ghost'}
              className="flex-1 text-xs h-8"
              onClick={() => setActiveTab('archives')}
            >
              Archives
            </Button>
          </div>
        )}

        <CardContent className="p-0 flex-1 overflow-hidden flex flex-col">
          {activeTab === 'chat' ? (
            <>
              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0"
              >
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground text-sm py-8">
                    No messages yet. Start the discussion!
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className="flex flex-col">
                      <div className="flex items-baseline gap-2">
                        <span className="font-bold text-xs">{msg.senderName}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(msg.sentAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm bg-muted p-2 rounded-md mt-1 break-words">
                        {msg.content}
                      </p>
                    </div>
                  ))
                )}
                {error && (
                  <div className="text-destructive text-xs p-2 bg-destructive/10 rounded">
                    {error}
                  </div>
                )}
              </div>
              <Separator />
              <div className="p-4 flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  className="flex-1"
                />
                <Button size="icon" onClick={handleSend} disabled={!isConnected || !input.trim()}>
                  <RiSendPlane2Line className="w-4 h-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <RiArchiveLine className="w-4 h-4" />
                Past Sessions
              </h3>
              {archivedRooms.length === 0 ? (
                <div className="text-center text-muted-foreground text-sm py-8">
                  No archived sessions found.
                </div>
              ) : (
                archivedRooms.map((room) => (
                  <div key={room.id} className="p-3 border rounded-md bg-muted/30 flex justify-between items-center group">
                    <div className="flex flex-col">
                      <span className="text-xs font-medium">Session {room.id.substring(0, 8)}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(room.createdAt!).toLocaleDateString()} at {new Date(room.createdAt!).toLocaleTimeString()}
                      </span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDeleteArchive(room.id)}
                    >
                      <RiDeleteBinLine className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
