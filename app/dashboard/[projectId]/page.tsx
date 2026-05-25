'use client';

import { useParams } from 'next/navigation';
import { ProjectMembersDialog } from '@/components/project-members-dialog';
import { ProjectCharactersDialog } from '@/components/project-characters-dialog';
import { Header } from '@/components/header';

export default function ProjectDashboard() {
  const params = useParams();
  const projectId = params.projectId as string;

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-2xl font-bold mb-4">Project Dashboard</h1>
      <p className="text-gray-500 max-w-md mb-8">
        Select a document from the sidebar to start writing, or create a new one using the button above.
      </p>
      
      <div className="flex gap-4">
        <ProjectMembersDialog projectId={projectId} />
        <ProjectCharactersDialog projectId={projectId} />
      </div>
    </div>
  );
}
