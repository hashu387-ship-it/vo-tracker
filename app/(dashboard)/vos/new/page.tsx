import { VOForm } from '@/components/vo/vo-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewVOPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/vos">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Variation Order</h1>
          <p className="text-muted-foreground">Create a new variation order record</p>
        </div>
      </div>

      <VOForm mode="create" />
    </div>
  );
}
