'use client';

import { useDraftSocket } from '@/app/hooks/useDraftSocket';
import { Skeleton } from '@/components/ui/skeleton';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';
import {
  useEffect
} from "react";

const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import('react-quill-new');
    return RQ;
  },
  {
    ssr: false,
    loading: () => <Skeleton className="h-[400px] w-full" />,
  }
);

interface DraftEditorProps {
  projectId: string;
}

export function DraftEditor({ projectId }: DraftEditorProps) {
  const { content, handleContentChange, isReady } = useDraftSocket(projectId);

  useEffect(() => {
    console.log({content});
  }, [content]);

  if (!isReady) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="h-[90%] border-none shadow-none">
      <div>
        <p className="text-2xl font-bold">Project Draft</p>
        <p className="text-sm text-muted-foreground">
          A collaborative scratchpad for your project. Changes are synced in real-time.
        </p>
      </div>
      <div className="w-full h-full pb-16">
        <ReactQuill
          theme="snow"
          value={content}
          onChange={(value, delta, source, editor) => handleContentChange(value, delta, source)}
          style={{
            width: '100%',
            height: '100%'
          }}
          modules={{
            toolbar: [
              [{ 'header': [1, 2, 3, false] }],
              ['bold', 'italic', 'underline'],
              ['blockquote', 'code-block'],
              [{ 'indent': '-1'}, { 'indent': '+1' }],
              [{ 'font': [] }],
              [{ 'align': [] }],
            ]
          }}
        />
      </div>
    </div>
  );
}
