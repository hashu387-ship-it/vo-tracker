'use client';

import { ProjectProvider } from '@/components/shell/project-provider';
import { AppShell } from '@/components/shell/app-shell';
import { ForecastView } from '@/components/forecast/forecast-view';

export default function ForecastPage() {
  return (
    <ProjectProvider>
      <AppShell>
        <div className="mx-auto max-w-6xl">
          <ForecastView />
        </div>
      </AppShell>
    </ProjectProvider>
  );
}
