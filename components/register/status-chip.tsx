import {
  AlertTriangle,
  CircleDashed,
  CircleDot,
  CheckCircle2,
  Clock,
  MinusCircle,
} from 'lucide-react';
import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import {
  PAYMENT_STATUS_META,
  VARIATION_STATUS_META,
  toneClasses,
  type PaymentStatus,
  type Tone,
  type VariationStatus,
} from '@/lib/domain/types';
import { cn } from '@/lib/utils';

/**
 * Status is never encoded by colour alone: every chip carries an icon and its
 * label, so it survives greyscale printing and colour-vision deficiency.
 */
const TONE_ICON: Record<Tone, React.ComponentType<{ className?: string }>> = {
  good: CheckCircle2,
  warning: Clock,
  serious: AlertTriangle,
  critical: CircleDot,
  neutral: MinusCircle,
};

export function StatusChip({
  status,
  kind,
  className,
  short,
}: {
  status: VariationStatus | PaymentStatus | null;
  kind: 'variation' | 'payment';
  className?: string;
  short?: boolean;
}) {
  if (!status) {
    return (
      <Badge className={cn('border-border bg-muted text-muted-foreground', className)}>
        <CircleDashed className="size-3" />
        No status
      </Badge>
    );
  }

  const meta =
    kind === 'variation'
      ? VARIATION_STATUS_META[status as VariationStatus]
      : PAYMENT_STATUS_META[status as PaymentStatus];

  const Icon = TONE_ICON[meta.tone];
  const tone = toneClasses(meta.tone);

  return (
    <Badge className={cn(tone.chip, className)} title={meta.description}>
      <Icon className="size-3" />
      {short ? meta.short : meta.label}
    </Badge>
  );
}

export function BallWithChip({ ballWith }: { ballWith: 'contractor' | 'client' | 'both' | 'none' }) {
  if (ballWith === 'none') return null;
  const label =
    ballWith === 'contractor' ? 'FFC to act' : ballWith === 'client' ? 'RSG to act' : 'Both to act';
  return (
    <span className="text-2xs font-medium uppercase tracking-wider text-muted-foreground">
      {label}
    </span>
  );
}
