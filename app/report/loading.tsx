import { SkeletonPage } from '@/components/ui/skeleton';

export default function Loading() {
  return <SkeletonPage tiles={4} panels={[12]} label="Loading the report" />;
}
