import { SkeletonPage } from '@/components/ui/skeleton';

export default function Loading() {
  return <SkeletonPage tiles={4} panels={[7, 5]} label="Loading the cashflow view" />;
}
