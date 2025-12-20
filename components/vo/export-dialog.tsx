'use client';

import { useState } from 'react';
import { Download, FileSpreadsheet, Loader2, Sparkles, BarChart3, TrendingUp, FileText, DollarSign, Calendar, Layers } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';

interface ExportDialogProps {
  searchParams: {
    search?: string;
    status?: string;
    submissionType?: string;
    sortBy?: string;
    sortOrder?: string;
  };
}

type ExportTemplate = 'standard' | 'detailed' | 'executive' | 'financial';

interface ExportPreset {
  id: string;
  name: string;
  description: string;
  icon: any;
  gradient: string;
  template: ExportTemplate;
  includeSummary: boolean;
  includeFinancialAnalysis: boolean;
  includeTimeline: boolean;
  groupByStatus: boolean;
  includeCharts: boolean;
  badge?: string;
  color: string;
}

const EXPORT_PRESETS: ExportPreset[] = [
  {
    id: 'quick',
    name: 'Quick Export',
    description: 'Essential data for quick analysis',
    icon: Sparkles,
    gradient: 'from-blue-500 to-cyan-500',
    color: 'blue',
    template: 'standard',
    includeSummary: false,
    includeFinancialAnalysis: false,
    includeTimeline: false,
    groupByStatus: false,
    includeCharts: false,
    badge: 'Fastest',
  },
  {
    id: 'complete',
    name: 'Complete Report',
    description: 'Full analysis with all insights',
    icon: BarChart3,
    gradient: 'from-purple-500 to-pink-500',
    color: 'purple',
    template: 'detailed',
    includeSummary: true,
    includeFinancialAnalysis: true,
    includeTimeline: true,
    groupByStatus: true,
    includeCharts: true,
    badge: 'Recommended',
  },
  {
    id: 'executive',
    name: 'Executive Summary',
    description: 'High-level insights for management',
    icon: TrendingUp,
    gradient: 'from-emerald-500 to-teal-500',
    color: 'emerald',
    template: 'executive',
    includeSummary: true,
    includeFinancialAnalysis: true,
    includeTimeline: false,
    groupByStatus: false,
    includeCharts: true,
    badge: 'Presentation',
  },
  {
    id: 'financial',
    name: 'Financial Deep Dive',
    description: 'Detailed financial analysis',
    icon: DollarSign,
    gradient: 'from-orange-500 to-red-500',
    color: 'orange',
    template: 'financial',
    includeSummary: true,
    includeFinancialAnalysis: true,
    includeTimeline: false,
    groupByStatus: false,
    includeCharts: true,
    badge: 'Finance',
  },
];

export function ExportDialog({ searchParams }: ExportDialogProps) {
  const [open, setOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>('complete');
  const { toast } = useToast();

  // Custom export options
  const [template, setTemplate] = useState<ExportTemplate>('detailed');
  const [includeSummary, setIncludeSummary] = useState(true);
  const [includeFinancialAnalysis, setIncludeFinancialAnalysis] = useState(true);
  const [includeTimeline, setIncludeTimeline] = useState(true);
  const [groupByStatus, setGroupByStatus] = useState(true);
  const [includeCharts, setIncludeCharts] = useState(true);

  const applyPreset = (presetId: string) => {
    const preset = EXPORT_PRESETS.find(p => p.id === presetId);
    if (!preset) return;

    setTemplate(preset.template);
    setIncludeSummary(preset.includeSummary);
    setIncludeFinancialAnalysis(preset.includeFinancialAnalysis);
    setIncludeTimeline(preset.includeTimeline);
    setGroupByStatus(preset.groupByStatus);
    setIncludeCharts(preset.includeCharts);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams();

      // Add search/filter params
      if (searchParams.search) params.set('search', searchParams.search);
      if (searchParams.status && searchParams.status !== 'all') {
        params.set('status', searchParams.status);
      }
      if (searchParams.submissionType && searchParams.submissionType !== 'all') {
        params.set('submissionType', searchParams.submissionType);
      }
      if (searchParams.sortBy) params.set('sortBy', searchParams.sortBy);
      if (searchParams.sortOrder) params.set('sortOrder', searchParams.sortOrder);

      // Add export options
      params.set('template', template);
      params.set('includeSummary', String(includeSummary));
      params.set('includeFinancialAnalysis', String(includeFinancialAnalysis));
      params.set('includeTimeline', String(includeTimeline));
      params.set('groupByStatus', String(groupByStatus));
      params.set('includeCharts', String(includeCharts));

      const response = await fetch(`/api/export?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `VO_Export_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: '✓ Export successful',
        description: 'Your beautifully formatted Excel file has been downloaded.',
      });
      setOpen(false);
    } catch (error) {
      toast({
        title: '✗ Export failed',
        description: error instanceof Error ? error.message : 'Failed to export data',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800 hover:shadow-md transition-all">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto p-0 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950">
        {/* Header Section */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-900 dark:to-indigo-900 p-8 pb-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-3xl text-white">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <FileSpreadsheet className="h-8 w-8" />
              </div>
              Export Excellence
            </DialogTitle>
            <DialogDescription className="text-blue-100 text-base mt-2">
              Transform your data into stunning, professional Excel reports
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-8 space-y-8">
          {/* Preset Cards Grid */}
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              Choose Your Export Style
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {EXPORT_PRESETS.map((preset) => {
                const Icon = preset.icon;
                const isSelected = selectedPreset === preset.id;

                return (
                  <div
                    key={preset.id}
                    onClick={() => {
                      setSelectedPreset(preset.id);
                      applyPreset(preset.id);
                    }}
                    className={`relative overflow-hidden cursor-pointer rounded-2xl p-6 transition-all duration-300 ${isSelected
                        ? `bg-gradient-to-br ${preset.gradient} text-white ring-4 ring-offset-2 ring-blue-500 ring-opacity-50 shadow-2xl scale-105`
                        : 'bg-white dark:bg-slate-800 hover:shadow-xl hover:scale-102 shadow-md border-2 border-transparent hover:border-blue-200'
                      }`}
                    style={{
                      background: isSelected && !preset.gradient
                        ? `linear-gradient(135deg, var(--tw-gradient-stops))`
                        : undefined,
                    }}
                  >
                    {/* Badge */}
                    {preset.badge && (
                      <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold ${isSelected ? 'bg-white/30 text-white' : 'bg-gradient-to-r ' + preset.gradient + ' text-white'
                        }`}>
                        {preset.badge}
                      </div>
                    )}

                    {/* Icon */}
                    <div className={`mb-4 p-3 rounded-xl inline-flex ${isSelected ? 'bg-white/20' : `bg-${preset.color}-50 dark:bg-${preset.color}-900/30`
                      }`}>
                      <Icon className={`h-8 w-8 ${isSelected ? 'text-white' : `text-${preset.color}-600 dark:text-${preset.color}-400`}`} />
                    </div>

                    {/* Content */}
                    <h4 className={`font-bold text-lg mb-2 ${isSelected ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                      {preset.name}
                    </h4>
                    <p className={`text-sm ${isSelected ? 'text-white/90' : 'text-slate-600 dark:text-slate-400'}`}>
                      {preset.description}
                    </p>

                    {/* Features Pills */}
                    <div className="mt-4 flex flex-wrap gap-1">
                      {preset.includeSummary && (
                        <span className={`text-xs px-2 py-1 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                          }`}>
                          Summary
                        </span>
                      )}
                      {preset.includeFinancialAnalysis && (
                        <span className={`text-xs px-2 py-1 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'
                          }`}>
                          Financial
                        </span>
                      )}
                      {preset.includeTimeline && (
                        <span className={`text-xs px-2 py-1 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'
                          }`}>
                          Timeline
                        </span>
                      )}
                    </div>

                    {/* Selection Indicator */}
                    {isSelected && (
                      <div className="absolute bottom-3 right-3">
                        <div className="bg-white rounded-full p-1">
                          <Sparkles className="h-4 w-4 text-blue-600" />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Custom Options Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Template Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-500" />
                Data Template
              </h3>
              <RadioGroup value={template} onValueChange={(value) => setTemplate(value as ExportTemplate)}>
                <div className="space-y-3">
                  {[
                    { value: 'standard', label: 'Standard', desc: 'Essential columns', icon: '📄' },
                    { value: 'detailed', label: 'Detailed', desc: 'All fields included', icon: '📊' },
                    { value: 'executive', label: 'Executive', desc: 'High-level overview', icon: '👔' },
                    { value: 'financial', label: 'Financial', desc: 'Financial focus with variance', icon: '💰' },
                  ].map((item) => (
                    <label
                      key={item.value}
                      htmlFor={item.value}
                      className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${template === item.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                          : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                    >
                      <RadioGroupItem value={item.value} id={item.value} className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{item.icon}</span>
                          <div className="font-semibold">{item.label}</div>
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">{item.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* Additional Features */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Layers className="h-5 w-5 text-purple-500" />
                Additional Features
              </h3>
              <div className="space-y-3">
                {[
                  {
                    id: 'summary',
                    checked: includeSummary,
                    onChange: setIncludeSummary,
                    icon: '📈',
                    label: 'Executive Summary',
                    desc: 'Dashboard with KPIs and status breakdown',
                  },
                  {
                    id: 'financial',
                    checked: includeFinancialAnalysis,
                    onChange: setIncludeFinancialAnalysis,
                    icon: '💵',
                    label: 'Financial Analysis',
                    desc: 'Variance, approval rate, and Top 10 VOs',
                  },
                  {
                    id: 'timeline',
                    checked: includeTimeline,
                    onChange: setIncludeTimeline,
                    icon: '📅',
                    label: 'Timeline Analysis',
                    desc: 'Monthly trends and statistics',
                  },
                  {
                    id: 'grouped',
                    checked: groupByStatus,
                    onChange: setGroupByStatus,
                    icon: '🗂️',
                    label: 'Group by Status',
                    desc: 'Separate sheets for each status',
                  },
                  {
                    id: 'charts',
                    checked: includeCharts,
                    onChange: setIncludeCharts,
                    icon: '🎨',
                    label: 'Visual Enhancements',
                    desc: 'Colors, formatting, and styling',
                  },
                ].map((item) => (
                  <label
                    key={item.id}
                    htmlFor={item.id}
                    className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${item.checked
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/30'
                        : 'border-slate-200 dark:border-slate-700 hover:border-purple-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                  >
                    <Checkbox
                      id={item.id}
                      checked={item.checked}
                      onCheckedChange={(checked) => item.onChange(checked as boolean)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{item.icon}</span>
                        <div className="font-semibold">{item.label}</div>
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">{item.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Export Button */}
          <div className="flex items-center justify-between pt-4">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              ✨ Your filters will be applied to the export
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isExporting}
                className="px-6"
              >
                Cancel
              </Button>
              <Button
                onClick={handleExport}
                disabled={isExporting}
                className="px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export to Excel
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
