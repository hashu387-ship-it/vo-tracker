import Link from 'next/link';
import { FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
      <FileQuestion className="h-16 w-16 text-muted-foreground" />
      <h2 className="mt-4 text-2xl font-bold">VO Not Found</h2>
      <p className="mt-2 text-muted-foreground">
        The Variation Order you are looking for does not exist or has been deleted.
      </p>
      <Link href="/vos" className="mt-6">
        <Button>Back to VOs</Button>
      </Link>
    </div>
  );
}
