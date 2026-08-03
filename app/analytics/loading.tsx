import { SkeletonPage } from '@/components/ui/skeleton';

export default function Loading() {
  return <SkeletonPage tiles={4} panels={[6, 6]} label="Loading analytics" />;
}
