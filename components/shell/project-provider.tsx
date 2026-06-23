'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { DEFAULT_PROJECT_ID, getProject, type ProjectMeta } from '@/lib/projects';

interface ProjectCtx {
  project: ProjectMeta;
  projectId: string;
  setProjectId: (id: string) => void;
}

const Ctx = createContext<ProjectCtx | undefined>(undefined);
const KEY = 'vo-active-project';

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projectId, setId] = useState(DEFAULT_PROJECT_ID);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem(KEY);
    if (saved) setId(saved);
  }, []);

  const setProjectId = useCallback((id: string) => {
    setId(id);
    if (typeof window !== 'undefined') localStorage.setItem(KEY, id);
  }, []);

  return (
    <Ctx.Provider value={{ project: getProject(projectId), projectId, setProjectId }}>
      {children}
    </Ctx.Provider>
  );
}

export function useProject() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useProject must be used within a ProjectProvider');
  return c;
}
