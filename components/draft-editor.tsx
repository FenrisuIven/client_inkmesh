'use client';

import { useDraftSocket } from '@/app/hooks/useDraftSocket';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface DraftEditorProps {
  projectId: string;
}

export function DraftEditor({ projectId }: DraftEditorProps) {
  const { content, handleContentChange, isReady } = useDraftSocket(projectId);

  if (!isReady) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <Card className="h-full border-none shadow-none">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-2xl font-bold">Project Draft</CardTitle>
        <p className="text-sm text-muted-foreground">
          A collaborative scratchpad for your project. Changes are synced in real-time.
        </p>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <Textarea
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="Start brainstorming here..."
          className="min-h-[600px] resize-none border-none p-0 text-lg leading-relaxed focus-visible:ring-0"
        />
      </CardContent>
    </Card>
  );
}
