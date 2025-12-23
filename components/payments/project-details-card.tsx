
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Save, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface ProjectDetails {
    id?: number;
    projectCode: string;
    projectName: string;
    contractor: string;
    contractDate: string;
    originalContractValue: number;
    revisedContractValue: number;
    advancePaymentTotal: number;
    advancePaymentPercent: number;
    advanceDeductedTillDate: number;
    advanceDeductedPercent: number;
    advanceBalance: number;
    advanceBalancePercent: number;
    totalRetention: number;
    retentionPercent: number;
    retentionDeductedTillDate: number;
    retentionDeductedPercent: number;
    retentionBalance: number;
    retentionBalancePercent: number;
    totalWorkDone: number;
    totalWorkDonePercent: number;
    balanceWorkDone: number;
    balanceWorkDonePercent: number;
    receivedAmount: number;
    receivedPercent: number;
}

const DEFAULT_PROJECT: ProjectDetails = {
    projectCode: 'R06-HW2C05-5020',
    projectName: '',
    contractor: 'First Fix',
    contractDate: '2023-09-20',
    originalContractValue: 217501556.12,
    revisedContractValue: 232612538.97,
    advancePaymentTotal: 65250466.83,
    advancePaymentPercent: 32.0,
    advanceDeductedTillDate: 54211168.65,
    advanceDeductedPercent: 83.08,
    advanceBalance: 11039298.18,
    advanceBalancePercent: 16.92,
    totalRetention: 11630626.95,
    retentionPercent: 5.0,
    retentionDeductedTillDate: 8663508.37,
    retentionDeductedPercent: 74.49,
    retentionBalance: 2967118.58,
    retentionBalancePercent: 25.51,
    totalWorkDone: 183107592.39,
    totalWorkDonePercent: 78.72,
    balanceWorkDone: 49504946.58,
    balanceWorkDonePercent: 21.28,
    receivedAmount: 173270167.85,
    receivedPercent: 74.49,
};

export function ProjectDetailsCard() {
    const [projectDetails, setProjectDetails] = useState<ProjectDetails>(DEFAULT_PROJECT);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<ProjectDetails>(DEFAULT_PROJECT);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchProjectDetails();
    }, []);

    const fetchProjectDetails = async () => {
        try {
            const res = await fetch('/api/project-details');
            const json = await res.json();
            if (json.data) {
                setProjectDetails(json.data);
                setEditData(json.data);
            }
        } catch (error) {
            console.error('Failed to fetch project details', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch('/api/project-details', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editData),
            });

            if (!res.ok) throw new Error('Failed to save');

            const json = await res.json();
            setProjectDetails(json.data);
            setIsEditing(false);
            toast.success('Project details updated');
        } catch (error) {
            toast.error('Failed to save project details');
        } finally {
            setIsSaving(false);
        }
    };

    const currency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
    };

    const percent = (value: number) => {
        return `${value.toFixed(2)}%`;
    };

    if (isLoading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <p className="text-gray-500">Loading project details...</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Project Details */}
            <Card className="lg:col-span-1">
                <CardHeader className="bg-rsg-navy text-white pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-semibold">PROJECT DETAILS</CardTitle>
                        {!isEditing ? (
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-white hover:bg-white/20"
                                onClick={() => setIsEditing(true)}
                            >
                                <Edit className="h-4 w-4" />
                            </Button>
                        ) : (
                            <div className="flex gap-1">
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 text-white hover:bg-white/20"
                                    onClick={handleSave}
                                    disabled={isSaving}
                                >
                                    <Save className="h-4 w-4" />
                                </Button>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 text-white hover:bg-white/20"
                                    onClick={() => {
                                        setEditData(projectDetails);
                                        setIsEditing(false);
                                    }}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="p-4 space-y-3 text-xs">
                    <div>
                        <p className="text-gray-500 text-[10px] font-medium">Project:</p>
                        {isEditing ? (
                            <Input
                                value={editData.projectCode}
                                onChange={(e) => setEditData({ ...editData, projectCode: e.target.value })}
                                className="h-7 text-xs mt-1"
                            />
                        ) : (
                            <p className="font-semibold text-rsg-blue">{projectDetails.projectCode}</p>
                        )}
                    </div>
                    <div>
                        <p className="text-gray-500 text-[10px] font-medium">Contractor:</p>
                        {isEditing ? (
                            <Input
                                value={editData.contractor}
                                onChange={(e) => setEditData({ ...editData, contractor: e.target.value })}
                                className="h-7 text-xs mt-1"
                            />
                        ) : (
                            <p className="font-semibold">{projectDetails.contractor}</p>
                        )}
                    </div>
                    <div>
                        <p className="text-gray-500 text-[10px] font-medium">Contract Date:</p>
                        {isEditing ? (
                            <Input
                                type="date"
                                value={editData.contractDate}
                                onChange={(e) => setEditData({ ...editData, contractDate: e.target.value })}
                                className="h-7 text-xs mt-1"
                            />
                        ) : (
                            <p className="font-semibold">
                                {format(new Date(projectDetails.contractDate), 'dd-MMM-yyyy')}
                            </p>
                        )}
                    </div>
                    <div className="pt-2 border-t">
                        <p className="text-gray-500 text-[10px] font-medium">Original Contract Value:</p>
                        {isEditing ? (
                            <Input
                                type="number"
                                step="0.01"
                                value={editData.originalContractValue}
                                onChange={(e) =>
                                    setEditData({ ...editData, originalContractValue: parseFloat(e.target.value) })
                                }
                                className="h-7 text-xs mt-1"
                            />
                        ) : (
                            <p className="font-bold text-blue-600">{currency(projectDetails.originalContractValue)}</p>
                        )}
                    </div>
                    <div>
                        <p className="text-gray-500 text-[10px] font-medium">Revised Contract Value:</p>
                        {isEditing ? (
                            <Input
                                type="number"
                                step="0.01"
                                value={editData.revisedContractValue}
                                onChange={(e) =>
                                    setEditData({ ...editData, revisedContractValue: parseFloat(e.target.value) })
                                }
                                className="h-7 text-xs mt-1"
                            />
                        ) : (
                            <p className="font-bold text-blue-600">{currency(projectDetails.revisedContractValue)}</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Advance Payment Summary */}
            <Card>
                <CardHeader className="bg-orange-600 text-white pb-3">
                    <CardTitle className="text-sm font-semibold">SUMMARY OF ADVANCE PAYMENT RECOVERY</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Advance Payment:</span>
                        <div className="text-right">
                            <p className="font-bold text-orange-600">
                                {currency(projectDetails.advancePaymentTotal)}
                            </p>
                            <p className="text-[10px] text-gray-500">{percent(projectDetails.advancePaymentPercent)}</p>
                        </div>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Deducted till Date:</span>
                        <div className="text-right">
                            <p className="font-semibold">{currency(projectDetails.advanceDeductedTillDate)}</p>
                            <p className="text-[10px] text-gray-500">
                                {percent(projectDetails.advanceDeductedPercent)}
                            </p>
                        </div>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t">
                        <span className="text-gray-600 font-medium">Balance:</span>
                        <div className="text-right">
                            <p className="font-bold text-green-600">{currency(projectDetails.advanceBalance)}</p>
                            <p className="text-[10px] text-gray-500">{percent(projectDetails.advanceBalancePercent)}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Retention Summary */}
            <Card>
                <CardHeader className="bg-purple-600 text-white pb-3">
                    <CardTitle className="text-sm font-semibold">SUMMARY OF RETENTION</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total Retention:</span>
                        <div className="text-right">
                            <p className="font-bold text-purple-600">{currency(projectDetails.totalRetention)}</p>
                            <p className="text-[10px] text-gray-500">{percent(projectDetails.retentionPercent)}</p>
                        </div>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Deducted till Date:</span>
                        <div className="text-right">
                            <p className="font-semibold">{currency(projectDetails.retentionDeductedTillDate)}</p>
                            <p className="text-[10px] text-gray-500">
                                {percent(projectDetails.retentionDeductedPercent)}
                            </p>
                        </div>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t">
                        <span className="text-gray-600 font-medium">Balance:</span>
                        <div className="text-right">
                            <p className="font-bold text-green-600">{currency(projectDetails.retentionBalance)}</p>
                            <p className="text-[10px] text-gray-500">
                                {percent(projectDetails.retentionBalancePercent)}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Work Summary */}
            <Card className="lg:col-span-3">
                <CardHeader className="bg-rsg-blue text-white pb-3">
                    <CardTitle className="text-sm font-semibold">WORK SUMMARY</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <p className="text-gray-600 text-[10px] mb-1">Received</p>
                            <p className="font-bold text-blue-700 text-sm">{currency(projectDetails.receivedAmount)}</p>
                            <p className="text-[10px] text-gray-500 mt-1">{percent(projectDetails.receivedPercent)}</p>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                            <p className="text-gray-600 text-[10px] mb-1">Total Work Done</p>
                            <p className="font-bold text-green-700 text-sm">{currency(projectDetails.totalWorkDone)}</p>
                            <p className="text-[10px] text-gray-500 mt-1">
                                {percent(projectDetails.totalWorkDonePercent)}
                            </p>
                        </div>
                        <div className="text-center p-3 bg-yellow-50 rounded-lg">
                            <p className="text-gray-600 text-[10px] mb-1">Balance Work Done</p>
                            <p className="font-bold text-yellow-700 text-sm">
                                {currency(projectDetails.balanceWorkDone)}
                            </p>
                            <p className="text-[10px] text-gray-500 mt-1">
                                {percent(projectDetails.balanceWorkDonePercent)}
                            </p>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                            <p className="text-gray-600 text-[10px] mb-1">Revised Contract Value</p>
                            <p className="font-bold text-purple-700 text-sm">
                                {currency(projectDetails.revisedContractValue)}
                            </p>
                            <p className="text-[10px] text-gray-500 mt-1">100%</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
