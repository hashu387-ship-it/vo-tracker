import { SkeletonPage } from '@/components/ui/skeleton';

export default function Loading() {
  return <SkeletonPage tiles={3} panels={[12]} label="Loading the activity log" />;
}
