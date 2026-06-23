import { commercialSummary } from '@/lib/data/commercial';

/**
 * Multi-project enterprise hub registry. HW2 is wired to the live dataset
 * (lib/data); the others are provisioned placeholders ready to be backed by
 * the Drizzle `projects` table once the DB is connected.
 */
export interface ProjectMeta {
  id: string;
  code: string;
  name: string;
  short: string;
  accent: string;
  live: boolean;
  revisedContract?: number;
}

export const PROJECTS: ProjectMeta[] = [
  {
    id: 'hw2',
    code: 'R06-HW2C05',
    name: 'HW2 — SW Hotel 02',
    short: 'HW2',
    accent: '#9E875D',
    live: true,
    revisedContract: commercialSummary.revisedContract,
  },
  { id: 'a09c07', code: 'R05-A09C07', name: 'A09C07', short: 'A09C07', accent: '#7a7363', live: false },
  { id: 'a09c08', code: 'R05-A09C08', name: 'A09C08', short: 'A09C08', accent: '#6e5d3a', live: false },
  { id: 'l09', code: 'L09-S01C07', name: 'L09 — S01C07', short: 'L09', accent: '#b3a079', live: false },
  { id: 'p09', code: 'P09', name: 'P09', short: 'P09', accent: '#514f46', live: false },
];

export const DEFAULT_PROJECT_ID = 'hw2';

export function getProject(id: string): ProjectMeta {
  return PROJECTS.find((p) => p.id === id) ?? PROJECTS[0];
}
