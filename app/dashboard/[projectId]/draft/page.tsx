'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { DraftEditor } from '@/components/draft-editor';
import { ChatSidebar } from '@/components/chat-sidebar';
import { Button } from '@/components/ui/button';
import { RiChat3Line } from '@remixicon/react';

export default function DraftPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="flex-1 flex overflow-hidden relative">
      <div className="flex-1 p-8 overflow-y-auto">
        <DraftEditor projectId={projectId} />
      </div>

      <ChatSidebar 
        projectId={projectId} 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
      />

      {!isChatOpen && (
        <Button
          onClick={() => setIsChatOpen(true)}
          className="absolute bottom-8 right-8 rounded-full h-14 w-14 shadow-lg p-0"
          title="Open Discussion"
        >
          <RiChat3Line className="w-6 h-6" />
        </Button>
      )}
    </div>
  );
}
