import Link from 'next/link';

import { EmptyState } from '@/components/register/page-header';
import { Button } from '@/components/ui/button';

export default function PaymentNotFound() {
  return (
    <div className="mx-auto max-w-lg py-16">
      <EmptyState
        title="That certificate is not in the register"
        description="It may have been deleted, or the link may be out of date."
        action={
          <Button asChild size="sm">
            <Link href="/payments">Back to the payment register</Link>
          </Button>
        }
      />
    </div>
  );
}
