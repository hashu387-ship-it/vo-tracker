import Link from 'next/link';

import { EmptyState } from '@/components/register/page-header';
import { Button } from '@/components/ui/button';

export default function VariationNotFound() {
  return (
    <div className="mx-auto max-w-lg py-16">
      <EmptyState
        title="That variation is not in the register"
        description="It may have been deleted, or the link may be out of date."
        action={
          <Button asChild size="sm">
            <Link href="/variations">Back to the VO log</Link>
          </Button>
        }
      />
    </div>
  );
}
