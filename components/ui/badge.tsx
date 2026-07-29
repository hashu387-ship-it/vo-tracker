import * as React from 'react';

import { cn } from '@/lib/utils';

export function Badge({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-2xs font-medium',
        className,
      )}
      {...props}
    />
  );
}
