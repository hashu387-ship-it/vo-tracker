'use client';

import { AlertTriangle, RotateCcw } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-3 py-20 text-center">
      <span className="flex size-11 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="size-5 text-destructive" />
      </span>
      <h1 className="text-lg font-semibold">Something went wrong loading the register</h1>
      <p className="text-sm text-muted-foreground">
        {error.message || 'An unexpected error occurred.'}
      </p>
      {error.digest ? (
        <p className="font-mono text-2xs text-muted-foreground">Reference {error.digest}</p>
      ) : null}
      <Button onClick={reset} className="mt-2">
        <RotateCcw className="size-4" /> Try again
      </Button>
    </div>
  );
}
