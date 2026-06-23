'use client';

import { ProjectProvider } from '@/components/shell/project-provider';
import { AppShell } from '@/components/shell/app-shell';
import { VoKanban } from '@/components/kanban/vo-kanban';

export default function KanbanPage() {
  return (
    <ProjectProvider>
      <AppShell>
        <div className="mx-auto max-w-[1400px]">
          <VoKanban />
        </div>
      </AppShell>
    </ProjectProvider>
  );
}
