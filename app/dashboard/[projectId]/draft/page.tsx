'use client';

import { useParams } from 'next/navigation';
import { DraftEditor } from '@/components/draft-editor';

export default function DraftPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <DraftEditor projectId={projectId} />
    </div>
  );
}
