"use client";

import ExcelJS from "exceljs";
import { PaymentApplication } from "@prisma/client";
import { format } from "date-fns";

interface ExportOptions {
    filename?: string;
    sheetName?: string;
    includeFilters?: boolean;
    filterInfo?: {
        searchQuery?: string;
        statusFilter?: string;
    };
}

export async function exportPaymentsToExcel(
    payments: PaymentApplication[],
    options: ExportOptions = {}
) {
    const {
        filename = `Payment_Register_${format(new Date(), "yyyy-MM-dd_HHmm")}`,
        sheetName = "Payment Register",
        includeFilters = true,
        filterInfo = {},
    } = options;

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "VO Tracker";
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet(sheetName, {
        views: [{ state: "frozen", xSplit: 0, ySplit: 4 }],
    });

    // Define RSG brand colors
    const rsgNavy = "002D56";
    const rsgGold = "C5A065";
    const headerBg = "1E293B";
    const altRowBg = "F8FAFC";

    // Title Row
    worksheet.mergeCells("A1:L1");
    const titleCell = worksheet.getCell("A1");
    titleCell.value = "PAYMENT REGISTER REPORT";
    titleCell.font = { name: "Arial", size: 18, bold: true, color: { argb: rsgNavy } };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    worksheet.getRow(1).height = 35;

    // Subtitle with export info
    worksheet.mergeCells("A2:L2");
    const subtitleCell = worksheet.getCell("A2");
    const filterText = [];
    if (filterInfo.searchQuery) filterText.push(`Search: "${filterInfo.searchQuery}"`);
    if (filterInfo.statusFilter && filterInfo.statusFilter !== "all") {
        filterText.push(`Status: ${filterInfo.statusFilter}`);
    }
    subtitleCell.value = `Generated: ${format(new Date(), "dd MMM yyyy, HH:mm")} | Records: ${payments.length}${filterText.length > 0 ? ` | Filters: ${filterText.join(", ")}` : ""}`;
    subtitleCell.font = { name: "Arial", size: 10, italic: true, color: { argb: "64748B" } };
    subtitleCell.alignment = { horizontal: "center", vertical: "middle" };
    worksheet.getRow(2).height = 22;

    // Empty row for spacing
    worksheet.getRow(3).height = 10;

    // Column definitions
    const columns = [
        { header: "Payment No", key: "paymentNo", width: 14 },
        { header: "Description", key: "description", width: 35 },
        { header: "Gross Amount (SAR)", key: "grossAmount", width: 18 },
        { header: "Advance Recovery", key: "advancePaymentRecovery", width: 18 },
        { header: "Retention", key: "retention", width: 15 },
        { header: "VAT Recovery", key: "vatRecovery", width: 15 },
        { header: "VAT (15%)", key: "vat", width: 14 },
        { header: "Net Payment (SAR)", key: "netPayment", width: 18 },
        { header: "Payment Status", key: "paymentStatus", width: 18 },
        { header: "Approval Status", key: "approvalStatus", width: 16 },
        { header: "Submitted Date", key: "submittedDate", width: 15 },
        { header: "Invoice Date", key: "invoiceDate", width: 15 },
    ];

    // Set columns
    worksheet.columns = columns.map((col) => ({
        key: col.key,
        width: col.width,
    }));

    // Header Row (Row 4)
    const headerRow = worksheet.getRow(4);
    columns.forEach((col, index) => {
        const cell = headerRow.getCell(index + 1);
        cell.value = col.header;
        cell.font = { name: "Arial", size: 11, bold: true, color: { argb: "FFFFFF" } };
        cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: rsgNavy },
        };
        cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
        cell.border = {
            top: { style: "thin", color: { argb: rsgGold } },
            bottom: { style: "thin", color: { argb: rsgGold } },
            left: { style: "thin", color: { argb: "E2E8F0" } },
            right: { style: "thin", color: { argb: "E2E8F0" } },
        };
    });
    headerRow.height = 28;

    // Data Rows
    payments.forEach((payment, index) => {
        const rowNumber = index + 5;
        const row = worksheet.getRow(rowNumber);

        const rowData = {
            paymentNo: payment.paymentNo,
            description: payment.description,
            grossAmount: payment.grossAmount || 0,
            advancePaymentRecovery: payment.advancePaymentRecovery || 0,
            retention: payment.retention || 0,
            vatRecovery: payment.vatRecovery || 0,
            vat: payment.vat || 0,
            netPayment: payment.netPayment || 0,
            paymentStatus: payment.paymentStatus,
            approvalStatus: (payment as any).approvalStatus || "Pending",
            submittedDate: payment.submittedDate
                ? format(new Date(payment.submittedDate), "dd MMM yyyy")
                : "-",
            invoiceDate: payment.invoiceDate
                ? format(new Date(payment.invoiceDate), "dd MMM yyyy")
                : "-",
        };

        columns.forEach((col, colIndex) => {
            const cell = row.getCell(colIndex + 1);
            cell.value = rowData[col.key as keyof typeof rowData];

            // Alternate row background
            if (index % 2 === 1) {
                cell.fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: altRowBg },
                };
            }

            // Cell borders
            cell.border = {
                top: { style: "thin", color: { argb: "E2E8F0" } },
                bottom: { style: "thin", color: { argb: "E2E8F0" } },
                left: { style: "thin", color: { argb: "E2E8F0" } },
                right: { style: "thin", color: { argb: "E2E8F0" } },
            };

            // Format currency columns
            const currencyKeys = [
                "grossAmount",
                "advancePaymentRecovery",
                "retention",
                "vatRecovery",
                "vat",
                "netPayment",
            ];
            if (currencyKeys.includes(col.key)) {
                cell.numFmt = '#,##0.00 "SAR"';
                cell.alignment = { horizontal: "right", vertical: "middle" };

                // Color coding for values
                if (col.key === "netPayment") {
                    cell.font = { name: "Arial", size: 10, bold: true, color: { argb: "059669" } };
                } else if (
                    col.key === "advancePaymentRecovery" ||
                    col.key === "retention" ||
                    col.key === "vatRecovery"
                ) {
                    cell.font = { name: "Arial", size: 10, color: { argb: "DC2626" } };
                } else if (col.key === "grossAmount") {
                    cell.font = { name: "Arial", size: 10, bold: true, color: { argb: "2563EB" } };
                } else {
                    cell.font = { name: "Arial", size: 10 };
                }
            } else {
                cell.font = { name: "Arial", size: 10 };
                cell.alignment = { horizontal: "left", vertical: "middle" };
            }

            // Status color coding
            if (col.key === "paymentStatus") {
                cell.alignment = { horizontal: "center", vertical: "middle" };
                const statusColors: Record<string, string> = {
                    Draft: "6B7280",
                    Submitted: "3B82F6",
                    "Submitted on ACONEX": "6366F1",
                    Certified: "F59E0B",
                    Paid: "10B981",
                };
                cell.font = {
                    name: "Arial",
                    size: 10,
                    bold: true,
                    color: { argb: statusColors[payment.paymentStatus] || "6B7280" },
                };
            }
        });

        row.height = 22;
    });

    // Summary Section
    const summaryStartRow = payments.length + 7;

    // Summary header
    worksheet.mergeCells(`A${summaryStartRow}:H${summaryStartRow}`);
    const summaryHeader = worksheet.getCell(`A${summaryStartRow}`);
    summaryHeader.value = "FINANCIAL SUMMARY";
    summaryHeader.font = { name: "Arial", size: 14, bold: true, color: { argb: rsgNavy } };
    summaryHeader.alignment = { horizontal: "left", vertical: "middle" };

    // Calculate totals
    const totals = payments.reduce(
        (acc, p) => ({
            grossAmount: acc.grossAmount + (p.grossAmount || 0),
            advancePaymentRecovery: acc.advancePaymentRecovery + (p.advancePaymentRecovery || 0),
            retention: acc.retention + (p.retention || 0),
            vatRecovery: acc.vatRecovery + (p.vatRecovery || 0),
            vat: acc.vat + (p.vat || 0),
            netPayment: acc.netPayment + (p.netPayment || 0),
        }),
        {
            grossAmount: 0,
            advancePaymentRecovery: 0,
            retention: 0,
            vatRecovery: 0,
            vat: 0,
            netPayment: 0,
        }
    );

    const summaryData = [
        { label: "Total Gross Amount", value: totals.grossAmount, color: "2563EB" },
        { label: "Total Advance Recovery", value: totals.advancePaymentRecovery, color: "DC2626" },
        { label: "Total Retention", value: totals.retention, color: "F59E0B" },
        { label: "Total VAT Recovery", value: totals.vatRecovery, color: "DC2626" },
        { label: "Total VAT (15%)", value: totals.vat, color: "6B7280" },
        { label: "Total Net Payment", value: totals.netPayment, color: "059669" },
    ];

    summaryData.forEach((item, index) => {
        const rowNum = summaryStartRow + index + 1;
        const row = worksheet.getRow(rowNum);

        const labelCell = row.getCell(1);
        labelCell.value = item.label;
        labelCell.font = { name: "Arial", size: 11, bold: true };
        labelCell.alignment = { horizontal: "left", vertical: "middle" };

        worksheet.mergeCells(`B${rowNum}:C${rowNum}`);
        const valueCell = row.getCell(2);
        valueCell.value = item.value;
        valueCell.numFmt = '#,##0.00 "SAR"';
        valueCell.font = { name: "Arial", size: 11, bold: true, color: { argb: item.color } };
        valueCell.alignment = { horizontal: "right", vertical: "middle" };

        // Highlight net payment row
        if (item.label === "Total Net Payment") {
            labelCell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "ECFDF5" },
            };
            valueCell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "ECFDF5" },
            };
            row.getCell(3).fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "ECFDF5" },
            };
        }

        row.height = 24;
    });

    // Status breakdown
    const statusBreakdownRow = summaryStartRow + summaryData.length + 3;
    worksheet.mergeCells(`A${statusBreakdownRow}:H${statusBreakdownRow}`);
    const statusHeader = worksheet.getCell(`A${statusBreakdownRow}`);
    statusHeader.value = "STATUS BREAKDOWN";
    statusHeader.font = { name: "Arial", size: 14, bold: true, color: { argb: rsgNavy } };

    const statusCounts = payments.reduce(
        (acc, p) => {
            acc[p.paymentStatus] = (acc[p.paymentStatus] || 0) + 1;
            return acc;
        },
        {} as Record<string, number>
    );

    Object.entries(statusCounts).forEach(([status, count], index) => {
        const rowNum = statusBreakdownRow + index + 1;
        const row = worksheet.getRow(rowNum);

        row.getCell(1).value = status;
        row.getCell(1).font = { name: "Arial", size: 11 };

        row.getCell(2).value = count;
        row.getCell(2).font = { name: "Arial", size: 11, bold: true };
        row.getCell(2).alignment = { horizontal: "center" };

        row.height = 22;
    });

    // Generate buffer and trigger download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);

    return true;
}

// Export for VO data
export async function exportVOsToExcel(
    vos: any[],
    options: { filename?: string } = {}
) {
    const { filename = `VO_Register_${format(new Date(), "yyyy-MM-dd_HHmm")}` } = options;

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "VO Tracker";
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet("VO Register", {
        views: [{ state: "frozen", xSplit: 0, ySplit: 4 }],
    });

    const rsgNavy = "002D56";
    const rsgGold = "C5A065";

    // Title
    worksheet.mergeCells("A1:J1");
    const titleCell = worksheet.getCell("A1");
    titleCell.value = "VARIATION ORDER REGISTER";
    titleCell.font = { name: "Arial", size: 18, bold: true, color: { argb: rsgNavy } };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    worksheet.getRow(1).height = 35;

    // Subtitle
    worksheet.mergeCells("A2:J2");
    const subtitleCell = worksheet.getCell("A2");
    subtitleCell.value = `Generated: ${format(new Date(), "dd MMM yyyy, HH:mm")} | Records: ${vos.length}`;
    subtitleCell.font = { name: "Arial", size: 10, italic: true, color: { argb: "64748B" } };
    subtitleCell.alignment = { horizontal: "center", vertical: "middle" };
    worksheet.getRow(2).height = 22;

    worksheet.getRow(3).height = 10;

    const columns = [
        { header: "VO No", key: "id", width: 10 },
        { header: "Title", key: "title", width: 35 },
        { header: "Status", key: "status", width: 15 },
        { header: "Submission Type", key: "submissionType", width: 18 },
        { header: "Proposal Value (SAR)", key: "proposalValue", width: 20 },
        { header: "Assessment Value (SAR)", key: "assessmentValue", width: 20 },
        { header: "Approved Amount (SAR)", key: "approvedAmount", width: 20 },
        { header: "Submission Date", key: "submissionDate", width: 15 },
        { header: "Submission Ref", key: "submissionReference", width: 18 },
        { header: "VOR Ref", key: "vorReference", width: 15 },
    ];

    worksheet.columns = columns.map((col) => ({ key: col.key, width: col.width }));

    // Header row
    const headerRow = worksheet.getRow(4);
    columns.forEach((col, index) => {
        const cell = headerRow.getCell(index + 1);
        cell.value = col.header;
        cell.font = { name: "Arial", size: 11, bold: true, color: { argb: "FFFFFF" } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: rsgNavy } };
        cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
        cell.border = {
            top: { style: "thin", color: { argb: rsgGold } },
            bottom: { style: "thin", color: { argb: rsgGold } },
            left: { style: "thin", color: { argb: "E2E8F0" } },
            right: { style: "thin", color: { argb: "E2E8F0" } },
        };
    });
    headerRow.height = 28;

    // Data rows
    vos.forEach((vo, index) => {
        const rowNumber = index + 5;
        const row = worksheet.getRow(rowNumber);

        const rowData = {
            id: `VO-${vo.id.toString().padStart(3, "0")}`,
            title: vo.title,
            status: vo.status,
            submissionType: vo.submissionType || "-",
            proposalValue: vo.proposalValue || 0,
            assessmentValue: vo.assessmentValue || 0,
            approvedAmount: vo.approvedAmount || 0,
            submissionDate: vo.submissionDate
                ? format(new Date(vo.submissionDate), "dd MMM yyyy")
                : "-",
            submissionReference: vo.submissionReference || "-",
            vorReference: vo.vorReference || "-",
        };

        columns.forEach((col, colIndex) => {
            const cell = row.getCell(colIndex + 1);
            cell.value = rowData[col.key as keyof typeof rowData];

            if (index % 2 === 1) {
                cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "F8FAFC" } };
            }

            cell.border = {
                top: { style: "thin", color: { argb: "E2E8F0" } },
                bottom: { style: "thin", color: { argb: "E2E8F0" } },
                left: { style: "thin", color: { argb: "E2E8F0" } },
                right: { style: "thin", color: { argb: "E2E8F0" } },
            };

            const currencyKeys = ["proposalValue", "assessmentValue", "approvedAmount"];
            if (currencyKeys.includes(col.key)) {
                cell.numFmt = '#,##0.00 "SAR"';
                cell.alignment = { horizontal: "right", vertical: "middle" };
                if (col.key === "approvedAmount") {
                    cell.font = { name: "Arial", size: 10, bold: true, color: { argb: "059669" } };
                } else {
                    cell.font = { name: "Arial", size: 10, color: { argb: "2563EB" } };
                }
            } else {
                cell.font = { name: "Arial", size: 10 };
                cell.alignment = { horizontal: "left", vertical: "middle" };
            }
        });

        row.height = 22;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);

    return true;
}
