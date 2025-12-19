import { VOList } from '@/components/vo/vo-list';

export default function VOsPage() {
  // Demo mode - always admin
  return <VOList isAdmin={true} />;
}
