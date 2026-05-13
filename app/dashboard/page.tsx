'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getMyProjects } from '@/lib/api';
import { Header } from '@/components/header';

interface Project {
  id: string;
  name: string;
  description: string | null;
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyProjects()
      .then((data) => {
        setProjects(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch projects:', err);
        setLoading(false);
      });
  }, []);

  const truncate = (str: string, n: number) => {
    if (!str || str.length <= n) return str;
    const subString = str.substring(0, n);
    const lastSpace = subString.lastIndexOf(' ');
    if (lastSpace === -1) return subString + '...';
    return subString.substring(0, lastSpace) + '...';
  };

  return (
    <div className="flex flex-col h-full items-center p-6">
      <h1 className="text-2xl font-bold mb-8 w-[70%] text-left">My Projects</h1>
      
      {loading ? (
        <div className="w-[70%] text-center mt-10">Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="w-[70%] text-center mt-10 text-muted-foreground">
          You haven't joined any projects yet.
        </div>
      ) : (
        <div className="w-full flex flex-col items-center gap-4">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/dashboard/${project.id}`}
              className="w-[70%] group"
            >
              <div className="border rounded-lg p-5 flex items-center justify-between hover:bg-accent/50 transition-colors shadow-sm">
                <div className="flex-1 pr-4">
                  <h2 className="font-bold text-xl group-hover:text-primary transition-colors">
                    {project.name}
                  </h2>
                  <p className="text-muted-foreground mt-1">
                    {truncate(project.description || '', 100)}
                  </p>
                </div>
                <div className="flex -space-x-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-background flex items-center justify-center text-[10px] font-bold text-slate-500">
                    U1
                  </div>
                  <div className="w-10 h-10 rounded-full bg-slate-300 border-2 border-background flex items-center justify-center text-[10px] font-bold text-slate-600">
                    U2
                  </div>
                  <div className="w-10 h-10 rounded-full bg-slate-400 border-2 border-background flex items-center justify-center text-[10px] font-bold text-slate-700">
                    U3
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
