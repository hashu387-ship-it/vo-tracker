import Link from 'next/link';

import { EmptyState } from '@/components/register/page-header';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg py-20">
      <EmptyState
        title="That page is not part of the register"
        description="Check the address, or head back to the command centre."
        action={
          <Button asChild size="sm">
            <Link href="/">Command centre</Link>
          </Button>
        }
      />
    </div>
  );
}
