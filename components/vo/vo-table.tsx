'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MessageSquare,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { StatusBadge } from './status-badge';
import { DeleteVODialog } from './delete-vo-dialog';
import { VO, useDeleteVO } from '@/lib/hooks/use-vos';
import { formatCurrency, formatDate } from '@/lib/utils';
import { submissionTypeConfig, VOStatus } from '@/lib/validations/vo';
import { useToast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface VOTableProps {
  vos: VO[];
  isLoading?: boolean;
  isAdmin?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (field: string) => void;
}

export function VOTable({ vos, isLoading, isAdmin, sortBy, sortOrder, onSort }: VOTableProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const deleteMutation = useDeleteVO();

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteMutation.mutateAsync(deleteId);
      toast({
        title: 'VO deleted',
        description: 'The Variation Order has been deleted successfully.',
      });
      setDeleteId(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete VO',
        variant: 'destructive',
      });
    }
  };

  const SortableHeader = ({ field, children }: { field: string; children: React.ReactNode }) => {
    const isActive = sortBy === field;
    return (
      <Button
        variant="ghost"
        onClick={() => onSort?.(field)}
        className="-ml-4 h-8 gap-1 font-medium"
      >
        {children}
        {isActive ? (
          sortOrder === 'asc' ? (
            <ArrowUp className="h-4 w-4" />
          ) : (
            <ArrowDown className="h-4 w-4" />
          )
        ) : (
          <ArrowUpDown className="h-4 w-4 opacity-50" />
        )}
      </Button>
    );
  };

  if (isLoading) {
    return (
      <div className="neo-table p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">ID</TableHead>
              <TableHead className="min-w-[250px]">Subject</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Proposal</TableHead>
              <TableHead>Approved</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px]">Notes</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 9 }).map((_, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (vos.length === 0) {
    return (
      <div className="neo-card p-8">
        <div className="flex h-64 flex-col items-center justify-center text-center">
          <p className="text-lg font-medium">No Variation Orders found</p>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search or filter criteria
          </p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="vo-table-container neo-table">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="w-[60px]">ID</TableHead>
              <TableHead className="min-w-[250px]">Subject</TableHead>
              <TableHead className="w-[100px]">Type</TableHead>
              <TableHead className="w-[120px]">Sub. Ref</TableHead>
              <TableHead className="w-[140px]">
                <SortableHeader field="submissionDate">Date</SortableHeader>
              </TableHead>
              <TableHead className="w-[130px] text-right">
                <SortableHeader field="proposalValue">Proposal</SortableHeader>
              </TableHead>
              <TableHead className="w-[130px] text-right">
                <SortableHeader field="approvedAmount">Approved</SortableHeader>
              </TableHead>
              <TableHead className="w-[180px]">Status</TableHead>
              <TableHead className="w-[80px] text-center">Notes</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vos.map((vo, index) => (
              <motion.tr
                key={vo.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.02 }}
                className="neo-table-row border-b transition-colors data-[state=selected]:bg-muted"
              >
                <TableCell className="font-mono text-sm">{vo.id}</TableCell>
                <TableCell>
                  <div className="max-w-[300px]">
                    <p className="truncate font-medium">{vo.subject}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={
                      submissionTypeConfig[vo.submissionType as keyof typeof submissionTypeConfig]
                        ?.color
                    }
                  >
                    {
                      submissionTypeConfig[vo.submissionType as keyof typeof submissionTypeConfig]
                        ?.label
                    }
                  </span>
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {vo.submissionReference || '-'}
                </TableCell>
                <TableCell>{formatDate(vo.submissionDate)}</TableCell>
                <TableCell className="text-right font-mono">
                  {formatCurrency(vo.proposalValue)}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {formatCurrency(vo.approvedAmount)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={vo.status as VOStatus} />
                </TableCell>
                <TableCell className="text-center">
                  {(vo.remarks || vo.actionNotes) ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 neo-btn-pressed rounded-full">
                          <MessageSquare className="h-4 w-4 text-primary" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="left" className="neo-card-sm max-w-[350px] p-4">
                        <div className="space-y-3">
                          {vo.remarks && (
                            <div>
                              <p className="text-xs font-semibold text-primary mb-1">Remarks:</p>
                              <p className="text-sm">{vo.remarks}</p>
                            </div>
                          )}
                          {vo.actionNotes && (
                            <div>
                              <p className="text-xs font-semibold text-primary mb-1">Action Notes:</p>
                              <p className="text-sm">{vo.actionNotes}</p>
                            </div>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="neo-card-sm">
                      <DropdownMenuItem onClick={() => router.push(`/vos/${vo.id}`)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      {isAdmin && (
                        <>
                          <DropdownMenuItem onClick={() => router.push(`/vos/${vo.id}/edit`)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeleteId(vo.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </div>

      <DeleteVODialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />
    </TooltipProvider>
  );
}
