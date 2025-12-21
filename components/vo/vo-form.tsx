'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import {
  createVOSchema,
  CreateVOInput,
  statusConfig,
  submissionTypeConfig,
  VOStatus,
  SubmissionType,
} from '@/lib/validations/vo';
import { useCreateVO, useUpdateVO, VO } from '@/lib/hooks/use-vos';

interface VOFormProps {
  vo?: VO;
  mode: 'create' | 'edit';
}

export function VOForm({ vo, mode }: VOFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const createMutation = useCreateVO();
  const updateMutation = useUpdateVO();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateVOInput>({
    resolver: zodResolver(createVOSchema),
    defaultValues: vo
      ? {
        subject: vo.subject,
        submissionType: vo.submissionType as SubmissionType,
        submissionReference: vo.submissionReference || undefined,
        responseReference: vo.responseReference || undefined,
        submissionDate: new Date(vo.submissionDate),
        assessmentValue: vo.assessmentValue || undefined,
        proposalValue: vo.proposalValue || undefined,
        approvedAmount: vo.approvedAmount || undefined,
        status: vo.status as VOStatus,
        vorReference: vo.vorReference || undefined,
        dvoReference: vo.dvoReference || undefined,
        dvoIssuedDate: vo.dvoIssuedDate ? new Date(vo.dvoIssuedDate) : undefined,
        remarks: vo.remarks || undefined,
        actionNotes: vo.actionNotes || undefined,
      }
      : {
        submissionType: 'VO',
        status: 'PendingWithFFC',
        submissionDate: new Date(),
      },
  });

  const submissionDate = watch('submissionDate');
  const dvoIssuedDate = watch('dvoIssuedDate');
  const submissionType = watch('submissionType');
  const status = watch('status');

  const onSubmit = async (data: CreateVOInput) => {
    try {
      if (mode === 'create') {
        await createMutation.mutateAsync(data as any);
        toast({
          title: 'VO created',
          description: 'The Variation Order has been created successfully.',
        });
      } else if (vo) {
        await updateMutation.mutateAsync({ id: vo.id, data: data as any });
        toast({
          title: 'VO updated',
          description: 'The Variation Order has been updated successfully.',
        });
      }
      router.push('/vos');
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="subject">
                Subject
              </Label>
              <Input
                id="subject"
                {...register('subject')}
                placeholder="Enter VO subject"
                className={errors.subject ? 'border-destructive' : ''}
              />
              {errors.subject && (
                <p className="text-sm text-destructive">{errors.subject.message}</p>
              )}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>
                  Submission Type
                </Label>
                <Select
                  value={submissionType}
                  onValueChange={(value) => setValue('submissionType', value as SubmissionType)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(submissionTypeConfig) as SubmissionType[]).map((key) => (
                      <SelectItem key={key} value={key}>
                        {submissionTypeConfig[key].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>
                  Status
                </Label>
                <Select
                  value={status}
                  onValueChange={(value) => setValue('status', value as VOStatus)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(statusConfig) as VOStatus[]).map((key) => (
                      <SelectItem key={key} value={key}>
                        {statusConfig[key].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="submissionReference">Submission Reference</Label>
                <Input
                  id="submissionReference"
                  {...register('submissionReference')}
                  placeholder="e.g., VO-001-2024"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="responseReference">Response Reference</Label>
                <Input
                  id="responseReference"
                  {...register('responseReference')}
                  placeholder="e.g., PMC-RES-001"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>
                Submission Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !submissionDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {submissionDate ? format(submissionDate, 'PPP') : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={submissionDate}
                    onSelect={(date) => date && setValue('submissionDate', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financial Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {/* Proposal Value - Always Visible for most, but label changes */}
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-2"
                >
                  <Label htmlFor="proposalValue">
                    {status === 'PendingWithFFC' ? 'Estimated Value' : 'Proposal Value'}
                  </Label>
                  <Input
                    id="proposalValue"
                    type="number"
                    step="0.01"
                    {...register('proposalValue', { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                </motion.div>

                {/* Assessment Value - Hidden for PendingWithFFC & PendingWithRSG */}
                {['PendingWithRSGFFC', 'ApprovedAwaitingDVO', 'DVORRIssued'].includes(status) && (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="assessmentValue">Assessment Value</Label>
                    <Input
                      id="assessmentValue"
                      type="number"
                      step="0.01"
                      {...register('assessmentValue', { valueAsNumber: true })}
                      placeholder="0.00"
                    />
                  </motion.div>
                )}

                {/* Approved Amount - Visible ONLY for Approved/DVO statuses */}
                {['ApprovedAwaitingDVO', 'DVORRIssued'].includes(status) && (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="approvedAmount">
                      Approved Amount
                    </Label>
                    <Input
                      id="approvedAmount"
                      type="number"
                      step="0.01"
                      {...register('approvedAmount', { valueAsNumber: true })}
                      placeholder="0.00"
                      className="border-emerald-500/50 focus-visible:ring-emerald-500/50"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reference & Tracking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="vorReference">VOR Reference</Label>
                <Input
                  id="vorReference"
                  {...register('vorReference')}
                  placeholder="e.g., VOR-001"
                />
              </div>

              {/* DVO Reference - Only for Approved/DVO statuses */}
              <AnimatePresence>
                {['ApprovedAwaitingDVO', 'DVORRIssued'].includes(status) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="dvoReference">DVO Reference</Label>
                    <Input
                      id="dvoReference"
                      {...register('dvoReference')}
                      placeholder="e.g., DVO-001"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* DVO Issued Date - Only for DVO RR Issued */}
            <AnimatePresence>
              {status === 'DVORRIssued' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <Label>DVO Issued Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal md:w-[280px]',
                          !dvoIssuedDate && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dvoIssuedDate ? format(dvoIssuedDate, 'PPP') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dvoIssuedDate || undefined}
                        onSelect={(date) => setValue('dvoIssuedDate', date || null)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea
                id="remarks"
                {...register('remarks')}
                placeholder="Enter any remarks or comments"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="actionNotes">Action Notes</Label>
              <Textarea
                id="actionNotes"
                {...register('actionNotes')}
                placeholder="Enter action items or follow-up notes"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Separator />

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === 'create' ? 'Create VO' : 'Save Changes'}
          </Button>
        </div>
      </form >
    </motion.div >
  );
}
