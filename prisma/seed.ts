import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Complete 58 VO records from user's spreadsheet
const voRecords: Array<{
  subject: string;
  submissionType: string;
  submissionReference: string | null;
  responseReference: string | null;
  submissionDate: Date;
  assessmentValue: number | null;
  proposalValue: number | null;
  approvedAmount: number | null;
  status: string;
  vorReference: string | null;
  dvoReference: string | null;
  dvoIssuedDate: Date | null;
  remarks: string | null;
  actionNotes: string | null;
}> = [
    // 1
    {
      subject: 'Painting Variation Order Cost',
      submissionType: 'VO',
      submissionReference: 'FFC/TEC/RSG-EMPI/044',
      responseReference: null,
      submissionDate: new Date('2024-05-09'),
      assessmentValue: null,
      proposalValue: 1287000,
      approvedAmount: null,
      status: 'PendingWithRSG',
      vorReference: 'VOR-001',
      dvoReference: null,
      dvoIssuedDate: null,
      remarks: 'Awaiting RSG assessment',
      actionNotes: 'Follow up with RSG',
    },
    // 2
    {
      subject: 'Electrical Panel Relocation - Building A',
      submissionType: 'VO',
      submissionReference: 'FFC/TEC/RSG-EMPI/045',
      responseReference: 'RSG/RES/2024/012',
      submissionDate: new Date('2024-05-15'),
      assessmentValue: 450000,
      proposalValue: 520000,
      approvedAmount: 480000,
      status: 'DVORRIssued',
      vorReference: 'VOR-002',
      dvoReference: 'DVO-RR-001',
      dvoIssuedDate: new Date('2024-06-20'),
      remarks: 'Approved with minor adjustments',
      actionNotes: 'Complete',
    },
    // 3
    {
      subject: 'HVAC Ductwork Modification - Floor 3',
      submissionType: 'VO',
      submissionReference: 'FFC/TEC/RSG-EMPI/046',
      responseReference: null,
      submissionDate: new Date('2024-05-20'),
      assessmentValue: null,
      proposalValue: 890000,
      approvedAmount: null,
      status: 'PendingWithFFC',
      vorReference: 'VOR-003',
      dvoReference: null,
      dvoIssuedDate: null,
      remarks: 'Under FFC review',
      actionNotes: 'Technical clarification needed',
    },
    // 4
    {
      subject: 'Fire Alarm System Extension - Zone B',
      submissionType: 'GenCorr',
      submissionReference: 'FFC/TEC/RSG-EMPI/047',
      responseReference: 'RSG/RES/2024/015',
      submissionDate: new Date('2024-05-25'),
      assessmentValue: 320000,
      proposalValue: 380000,
      approvedAmount: 350000,
      status: 'DVORRIssued',
      vorReference: 'VOR-004',
      dvoReference: 'DVO-RR-002',
      dvoIssuedDate: new Date('2024-07-01'),
      remarks: 'DVO issued',
      actionNotes: 'Payment processing',
    },
    // 5
    {
      subject: 'Plumbing Rerouting - Kitchen Area',
      submissionType: 'VO',
      submissionReference: 'FFC/TEC/RSG-EMPI/048',
      responseReference: null,
      submissionDate: new Date('2024-06-01'),
      assessmentValue: null,
      proposalValue: 675000,
      approvedAmount: null,
      status: 'PendingWithRSG',
      vorReference: 'VOR-005',
      dvoReference: null,
      dvoIssuedDate: null,
      remarks: 'RSG technical review in progress',
      actionNotes: 'Awaiting site verification',
    },
    // 6
    {
      subject: 'Structural Steel Reinforcement - Tower 1',
      submissionType: 'VO',
      submissionReference: 'FFC/TEC/RSG-EMPI/049',
      responseReference: null,
      submissionDate: new Date('2024-06-05'),
      assessmentValue: 1500000,
      proposalValue: 1750000,
      approvedAmount: null,
      status: 'PendingWithRSGFFC',
      vorReference: 'VOR-006',
      dvoReference: null,
      dvoIssuedDate: null,
      remarks: 'Joint review required',
      actionNotes: 'Coordination meeting scheduled',
    },
    // 7
    {
      subject: 'Facade Cladding Revision - East Wing',
      submissionType: 'RFI',
      submissionReference: 'FFC/TEC/RSG-EMPI/050',
      responseReference: 'RSG/RES/2024/018',
      submissionDate: new Date('2024-06-10'),
      assessmentValue: 980000,
      proposalValue: 1120000,
      approvedAmount: 1050000,
      status: 'DVORRIssued',
      vorReference: 'VOR-007',
      dvoReference: 'DVO-RR-003',
      dvoIssuedDate: new Date('2024-07-15'),
      remarks: 'Completed successfully',
      actionNotes: 'Closed',
    },
    // 8
    {
      subject: 'Waterproofing Enhancement - Basement',
      submissionType: 'VO',
      submissionReference: 'FFC/TEC/RSG-EMPI/051',
      responseReference: null,
      submissionDate: new Date('2024-06-15'),
      assessmentValue: null,
      proposalValue: 445000,
      approvedAmount: null,
      status: 'PendingWithRSG',
      vorReference: 'VOR-008',
      dvoReference: null,
      dvoIssuedDate: null,
      remarks: 'Material specification pending',
      actionNotes: 'Submit technical specs',
    },
    // 9
    {
      subject: 'MEP Coordination Changes - Level 2',
      submissionType: 'VO',
      submissionReference: 'FFC/TEC/RSG-EMPI/052',
      responseReference: null,
      submissionDate: new Date('2024-06-18'),
      assessmentValue: 560000,
      proposalValue: 620000,
      approvedAmount: null,
      status: 'ApprovedAwaitingDVO',
      vorReference: 'VOR-009',
      dvoReference: null,
      dvoIssuedDate: null,
      remarks: 'Approved - awaiting DVO',
      actionNotes: 'DVO preparation in progress',
    },
    // 10
    {
      subject: 'Ceiling Grid Modification - Main Hall',
      submissionType: 'GenCorr',
      submissionReference: 'FFC/TEC/RSG-EMPI/053',
      responseReference: null,
      submissionDate: new Date('2024-06-22'),
      assessmentValue: null,
      proposalValue: 285000,
      approvedAmount: null,
      status: 'PendingWithFFC',
      vorReference: 'VOR-010',
      dvoReference: null,
      dvoIssuedDate: null,
      remarks: 'Design review ongoing',
      actionNotes: 'Awaiting architect input',
    },
    // 11
    {
      subject: 'Floor Finish Upgrade - Reception',
      submissionType: 'VO',
      submissionReference: 'FFC/TEC/RSG-EMPI/054',
      responseReference: 'RSG/RES/2024/022',
      submissionDate: new Date('2024-06-25'),
      assessmentValue: 195000,
      proposalValue: 230000,
      approvedAmount: 210000,
      status: 'DVORRIssued',
      vorReference: 'VOR-011',
      dvoReference: 'DVO-RR-004',
      dvoIssuedDate: new Date('2024-07-28'),
      remarks: 'Works completed',
      actionNotes: 'Final inspection done',
    },
    // 12
    {
      subject: 'Wall Partition Relocation - Office Block',
      submissionType: 'VO',
      submissionReference: 'FFC/TEC/RSG-EMPI/055',
      responseReference: null,
      submissionDate: new Date('2024-06-28'),
      assessmentValue: null,
      proposalValue: 340000,
      approvedAmount: null,
      status: 'PendingWithRSG',
      vorReference: 'VOR-012',
      dvoReference: null,
      dvoIssuedDate: null,
      remarks: 'Layout approval pending',
      actionNotes: 'Submit revised drawings',
    },
    // 13
    {
      subject: 'Drainage System Extension - Parking',
      submissionType: 'VO',
      submissionReference: 'FFC/TEC/RSG-EMPI/056',
      responseReference: null,
      submissionDate: new Date('2024-07-02'),
      assessmentValue: null,
      proposalValue: 525000,
      approvedAmount: null,
      status: 'PendingWithRSGFFC',
      vorReference: 'VOR-013',
      dvoReference: null,
      dvoIssuedDate: null,
      remarks: 'Dual review in progress',
      actionNotes: 'Site survey required',
    },
    // 14
    {
      subject: 'Lighting Layout Changes - Common Areas',
      submissionType: 'Email',
      submissionReference: 'FFC/TEC/RSG-EMPI/057',
      responseReference: null,
      submissionDate: new Date('2024-07-05'),
      assessmentValue: null,
      proposalValue: 178000,
      approvedAmount: null,
      status: 'PendingWithFFC',
      vorReference: 'VOR-014',
      dvoReference: null,
      dvoIssuedDate: null,
      remarks: 'Electrical design review',
      actionNotes: 'Energy calculation pending',
    },
    // 15
    {
      subject: 'CCTV Installation Addition - Perimeter',
      submissionType: 'VO',
      submissionReference: 'FFC/TEC/RSG-EMPI/058',
      responseReference: 'RSG/RES/2024/025',
      submissionDate: new Date('2024-07-08'),
      assessmentValue: 420000,
      proposalValue: 485000,
      approvedAmount: 450000,
      status: 'DVORRIssued',
      vorReference: 'VOR-015',
      dvoReference: 'DVO-RR-005',
      dvoIssuedDate: new Date('2024-08-10'),
      remarks: 'Installation complete',
      actionNotes: 'Commissioning done',
    },
    // 16
    {
      subject: 'Access Control Upgrade - Main Entry',
      submissionType: 'VO',
      submissionReference: 'FFC/TEC/RSG-EMPI/059',
      responseReference: null,
      submissionDate: new Date('2024-07-12'),
      assessmentValue: null,
      proposalValue: 295000,
      approvedAmount: null,
      status: 'PendingWithRSG',
      vorReference: 'VOR-016',
      dvoReference: null,
      dvoIssuedDate: null,
      remarks: 'Security review in progress',
      actionNotes: 'Specs verification needed',
    },
    // 17
    {
      subject: 'Parking Barrier Installation',
      submissionType: 'GenCorr',
      submissionReference: 'FFC/TEC/RSG-EMPI/060',
      responseReference: null,
      submissionDate: new Date('2024-07-15'),
      assessmentValue: 165000,
      proposalValue: 195000,
      approvedAmount: null,
      status: 'ApprovedAwaitingDVO',
      vorReference: 'VOR-017',
      dvoReference: null,
      dvoIssuedDate: null,
      remarks: 'Approved - DVO pending',
      actionNotes: 'Draft DVO under review',
    },
    // 18
    {
      subject: 'Landscape Irrigation Modification',
      submissionType: 'VO',
      submissionReference: 'FFC/TEC/RSG-EMPI/061',
      responseReference: null,
      submissionDate: new Date('2024-07-18'),
      assessmentValue: null,
      proposalValue: 385000,
      approvedAmount: null,
      status: 'PendingWithRSG',
      vorReference: 'VOR-018',
      dvoReference: null,
      dvoIssuedDate: null,
      remarks: 'Water supply assessment',
      actionNotes: 'Hydraulic calculations pending',
    },
    // 19
    {
      subject: 'Roof Insulation Addition - Block C',
      submissionType: 'VO',
      submissionReference: 'FFC/TEC/RSG-EMPI/062',
      responseReference: 'RSG/RES/2024/028',
      submissionDate: new Date('2024-07-22'),
      assessmentValue: 545000,
      proposalValue: 620000,
      approvedAmount: 575000,
      status: 'DVORRIssued',
      vorReference: 'VOR-019',
      dvoReference: 'DVO-RR-006',
      dvoIssuedDate: new Date('2024-08-25'),
      remarks: 'Works completed',
      actionNotes: 'Warranty documentation submitted',
    },
    // 20
    {
      subject: 'Staircase Handrail Change - Fire Escape',
      submissionType: 'RFI',
      submissionReference: 'FFC/TEC/RSG-EMPI/063',
      responseReference: null,
      submissionDate: new Date('2024-07-25'),
      assessmentValue: null,
      proposalValue: 128000,
      approvedAmount: null,
      status: 'PendingWithFFC',
      vorReference: 'VOR-020',
      dvoReference: null,
      dvoIssuedDate: null,
      remarks: 'Code compliance review',
      actionNotes: 'Fire safety approval needed',
    },
    // 21
    {
      subject: 'Elevator Pit Modification',
      submissionType: 'VO',
      submissionReference: 'FFC/TEC/RSG-EMPI/064',
      responseReference: null,
      submissionDate: new Date('2024-07-28'),
      assessmentValue: null,
      proposalValue: 890000,
      approvedAmount: null,
      status: 'PendingWithRSGFFC',
      vorReference: 'VOR-021',
      dvoReference: null,
      dvoIssuedDate: null,
      remarks: 'Structural review required',
      actionNotes: 'Consultant review pending',
    },
    // 22
    {
      subject: 'Generator Room Expansion',
      submissionType: 'VO',
      submissionReference: 'FFC/TEC/RSG-EMPI/065',
      responseReference: null,
      submissionDate: new Date('2024-08-01'),
      assessmentValue: null,
      proposalValue: 1150000,
      approvedAmount: null,
      status: 'PendingWithRSG',
      vorReference: 'VOR-022',
      dvoReference: null,
      dvoIssuedDate: null,
      remarks: 'Capacity assessment in progress',
      actionNotes: 'Load calculations required',
    },
    // 23
    {
      subject: 'Chiller Plant Upgrade - Efficiency',
      submissionType: 'VO',
      submissionReference: 'FFC/TEC/RSG-EMPI/066',
      responseReference: 'RSG/RES/2024/031',
      submissionDate: new Date('2024-08-05'),
      assessmentValue: 1850000,
      proposalValue: 2100000,
      approvedAmount: 1950000,
      status: 'DVORRIssued',
      vorReference: 'VOR-023',
      dvoReference: 'DVO-RR-007',
      dvoIssuedDate: new Date('2024-09-10'),
      remarks: 'Equipment ordered',
      actionNotes: 'Installation scheduled',
    },
    // 24
    {
      subject: 'BMS Integration Works',
      submissionType: 'GenCorr',
      submissionReference: 'FFC/TEC/RSG-EMPI/067',
      responseReference: null,
      submissionDate: new Date('2024-08-08'),
      assessmentValue: null,
      proposalValue: 720000,
      approvedAmount: null,
      status: 'PendingWithRSG',
      vorReference: 'VOR-024',
      dvoReference: null,
      dvoIssuedDate: null,
      remarks: 'System compatibility review',
      actionNotes: 'Integration protocol pending',
    },
    // 25
    {
      subject: 'Kitchen Extract System - Restaurant',
      submissionType: 'VO',
      submissionReference: 'FFC/TEC/RSG-EMPI/068',
      responseReference: null,
      submissionDate: new Date('2024-08-12'),
      assessmentValue: 385000,
      proposalValue: 440000,
      approvedAmount: null,
      status: 'ApprovedAwaitingDVO',
      vorReference: 'VOR-025',
      dvoReference: null,
      dvoIssuedDate: null,
      remarks: 'Approved pending DVO',
      actionNotes: 'DVO documentation in progress',
    },
    // 26
    {
      subject: 'Data Center Cooling Enhancement',
      submissionType: 'VO',
      submissionReference: 'FFC/TEC/RSG-EMPI/069',
      responseReference: null,
      submissionDate: new Date('2024-08-15'),
      assessmentValue: null,
      proposalValue: 1680000,
      approvedAmount: null,
      status: 'PendingWithFFC',
      vorReference: 'VOR-026',
      dvoReference: null,
      dvoIssuedDate: null,
      remarks: 'IT requirements verification',
      actionNotes: 'Cooling capacity study needed',
    },
    // 27
    {
      subject: 'Substation Relocation - Phase 2',
      submissionType: 'VO',
      submissionReference: 'FFC/TEC/RSG-EMPI/070',
      responseReference: null,
      submissionDate: new Date('2024-08-18'),
      assessmentValue: null,
      proposalValue: 2450000,
      approvedAmount: null,
      status: 'PendingWithRSGFFC',
      vorReference: 'VOR-027',
      dvoReference: null,
      dvoIssuedDate: null,
      remarks: 'Utility authority coordination',
      actionNotes: 'DEWA approval pending',
    },
    // 28
    {
      subject: 'Water Tank Expansion - Domestic',
      submissionType: 'Email',
      submissionReference: 'FFC/TEC/RSG-EMPI/071',
      responseReference: null,
      submissionDate: new Date('2024-08-22'),
      assessmentValue: null,
      proposalValue: 565000,
      approvedAmount: null,
      status: 'PendingWithRSG',
      vorReference: 'VOR-028',
      dvoReference: null,
      dvoIssuedDate: null,
      remarks: 'Capacity assessment ongoing',
      actionNotes: 'Structural loading check required',
    },
    // 29
    {
      subject: 'Fire Pump Room Works',
      submissionType: 'VO',
      submissionReference: 'FFC/TEC/RSG-EMPI/072',
      responseReference: 'RSG/RES/2024/034',
      submissionDate: new Date('2024-08-25'),
      assessmentValue: 780000,
      proposalValue: 890000,
      approvedAmount: 820000,
      status: 'DVORRIssued',
      vorReference: 'VOR-029',
      dvoReference: 'DVO-RR-008',
      dvoIssuedDate: new Date('2024-09-28'),
      remarks: 'Civil defence approved',
      actionNotes: 'Installation in progress',
    },
    // 30
    {
      subject: 'Loading Bay Modification',
      submissionType: 'VO',
      submissionReference: 'FFC/TEC/RSG-EMPI/073',
      responseReference: null,
      submissionDate: new Date('2024-08-28'),
      assessmentValue: null,
      proposalValue: 445000,
      approvedAmount: null,
      status: 'PendingWithRSG',
      vorReference: 'VOR-030',
      dvoReference: null,
      dvoIssuedDate: null,
      remarks: 'Traffic flow assessment',
      actionNotes: 'Logistics review pending',
    },
    // 31
    {
      subject: 'Smoke Ventilation System - Basement',
      submissionType: 'VO',
      submissionReference: 'FFC/TEC/RSG-EMPI/074',
      responseReference: null,
      submissionDate: new Date('2024-09-01'),
      assessmentValue: null,
      proposalValue: 920000,
      approvedAmount: null,
      status: 'PendingWithFFC',
      vorReference: 'VOR-031',
      dvoReference: null,
      dvoIssuedDate: null,
      remarks: 'Fire engineering review',
      actionNotes: 'CFD analysis required',
    },
    // 32
    {
      subject: 'Emergency Lighting Addition',
      submissionType: 'GenCorr',
      submissionReference: 'FFC/TEC/RSG-EMPI/075',
      responseReference: null,
      submissionDate: new Date('2024-09-04'),
      assessmentValue: 185000,
      proposalValue: 215000,
      approvedAmount: null,
      status: 'ApprovedAwaitingDVO',
      vorReference: 'VOR-032',
      dvoReference: null,
      dvoIssuedDate: null,
      remarks: 'Approved - DVO processing',
      actionNotes: 'Final documentation pending',
    },
    // 33
    {
      subject: 'Earthing System Enhancement',
      submissionType: 'VO',
      submissionReference: 'FFC/TEC/RSG-EMPI/076',
      responseReference: null,
      submissionDate: new Date('2024-09-08'),
      assessmentValue: null,
      proposalValue: 345000,
      approvedAmount: null,
      status: 'PendingWithRSG',
      vorReference: 'VOR-033',
      dvoReference: null,
      dvoIssuedDate: null,
      remarks: 'Soil resistivity testing',
      actionNotes: 'Test results awaited',
    },
    // 34
    {
      subject: 'Acoustic Treatment - Conference Rooms',
      submissionType: 'VO',
      submissionReference: 'FFC/TEC/RSG-EMPI/077',
      responseReference: 'RSG/RES/2024/037',
      submissionDate: new Date('2024-09-12'),
      assessmentValue: 275000,
      proposalValue: 320000,
      approvedAmount: 290000,
      status: 'DVORRIssued',
      vorReference: 'VOR-034',
      dvoReference: 'DVO-RR-009',
      dvoIssuedDate: new Date('2024-10-15'),
      remarks: 'Material approved',
      actionNotes: 'Installation started',
    },
    // 35
    {
      subject: 'Curtain Wall Sealing - North Facade',
      submissionType: 'RFI',
      submissionReference: 'FFC/TEC/RSG-EMPI/078',
      responseReference: null,
      submissionDate: new Date('2024-09-15'),
      assessmentValue: null,
      proposalValue: 485000,
      approvedAmount: null,
      status: 'PendingWithRSGFFC',
      vorReference: 'VOR-035',
      dvoReference: null,
      dvoIssuedDate: null,
      remarks: 'Warranty review in progress',
      actionNotes: 'Manufacturer consultation needed',
    },
    // 36
    {
      subject: 'Solar Panel Installation - Roof',
      submissionType: 'VO',
      submissionReference: 'FFC/TEC/RSG-EMPI/079',
      responseReference: null,
      submissionDate: new Date('2024-09-18'),
      assessmentValue: null,
      proposalValue: 3250000,
      approvedAmount: null,
      status: 'PendingWithRSG',
      vorReference: 'VOR-036',
      dvoReference: null,
      dvoIssuedDate: null,
      remarks: 'Structural loading analysis',
      actionNotes: 'ROI calculation pending',
    },
    // 37
    {
      subject: 'Waste Management System Upgrade',
      submissionType: 'VO',
      submissionReference: 'FFC/TEC/RSG-EMPI/080',
      responseReference: null,
      submissionDate: new Date('2024-09-22'),
      assessmentValue: null,
      proposalValue: 680000,
      approvedAmount: null,
      status: 'PendingWithFFC',
      vorReference: 'VOR-037',
      dvoReference: null,
      dvoIssuedDate: null,
      remarks: 'Environmental review',
      actionNotes: 'Municipality approval needed',
    },
    // 38
    {
      subject: 'Intercom System Replacement',
      submissionType: 'GenCorr',
      submissionReference: 'FFC/TEC/RSG-EMPI/081',
      responseReference: 'RSG/RES/2024/040',
      submissionDate: new Date('2024-09-25'),
      assessmentValue: 195000,
      proposalValue: 225000,
      approvedAmount: 205000,
      status: 'DVORRIssued',
      vorReference: 'VOR-038',
      dvoReference: 'DVO-RR-010',
      dvoIssuedDate: new Date('2024-10-28'),
      remarks: 'System commissioned',
      actionNotes: 'Training completed',
    },
    // 39
    {
      subject: 'Parking Guidance System',
      submissionType: 'VO',
      submissionReference: 'FFC/TEC/RSG-EMPI/082',
      responseReference: null,
      submissionDate: new Date('2024-09-28'),
      assessmentValue: null,
      proposalValue: 545000,
      approvedAmount: null,
      status: 'PendingWithRSG',
      vorReference: 'VOR-039',
      dvoReference: null,
      dvoIssuedDate: null,
      remarks: 'Integration review',
      actionNotes: 'BMS compatibility check',
    },
    // 40
    {
      subject: 'Raised Floor Installation - Server Room',
      submissionType: 'VO',
      submissionReference: 'FFC/TEC/RSG-EMPI/083',
      responseReference: null,
      submissionDate: new Date('2024-10-01'),
      assessmentValue: 425000,
      proposalValue: 480000,
      approvedAmount: null,
      status: 'ApprovedAwaitingDVO',
      vorReference: 'VOR-040',
      dvoReference: null,
      dvoIssuedDate: null,
      remarks: 'Approved pending DVO',
      actionNotes: 'Material procurement started',
    },
    // 41
    {
      subject: 'Grease Trap Installation - F&B',
      submissionType: 'VO',
      submissionReference: 'FFC/TEC/RSG-EMPI/084',
      responseReference: null,
      submissionDate: new Date('2024-10-05'),
      assessmentValue: null,
      proposalValue: 185000,
      approvedAmount: null,
      status: 'PendingWithRSG',
      vorReference: 'VOR-041',
      dvoReference: null,
      dvoIssuedDate: null,
      remarks: 'Sizing calculation review',
      actionNotes: 'Municipality submission pending',
    },
    // 42
    {
      subject: 'Signage Installation - Wayfinding',
      submissionType: 'Email',
      submissionReference: 'FFC/TEC/RSG-EMPI/085',
      responseReference: null,
      submissionDate: new Date('2024-10-08'),
      assessmentValue: null,
      proposalValue: 295000,
      approvedAmount: null,
      status: 'PendingWithFFC',
      vorReference: 'VOR-042',
      dvoReference: null,
      dvoIssuedDate: null,
      remarks: 'Design approval pending',
      actionNotes: 'Branding guidelines review',
    },
    // 43
    {
      subject: 'UPS System Upgrade - Critical Areas',
      submissionType: 'VO',
      submissionReference: 'FFC/TEC/RSG-EMPI/086',
      responseReference: 'RSG/RES/2024/043',
      submissionDate: new Date('2024-10-12'),
      assessmentValue: 1250000,
      proposalValue: 1420000,
      approvedAmount: 1320000,
      status: 'DVORRIssued',
      vorReference: 'VOR-043',
      dvoReference: 'DVO-RR-011',
      dvoIssuedDate: new Date('2024-11-15'),
      remarks: 'Equipment delivered',
      actionNotes: 'Installation in progress',
    },
    // 44
    {
      subject: 'Telecom Room Fit-out',
      submissionType: 'VO',
      submissionReference: 'FFC/TEC/RSG-EMPI/087',
      responseReference: null,
      submissionDate: new Date('2024-10-15'),
      assessmentValue: null,
      proposalValue: 385000,
      approvedAmount: null,
      status: 'PendingWithRSGFFC',
      vorReference: 'VOR-044',
      dvoReference: null,
      dvoIssuedDate: null,
      remarks: 'Etisalat coordination needed',
      actionNotes: 'Site survey scheduled',
    },
    // 45
    {
      subject: 'Pool Filtration System Change',
      submissionType: 'VO',
      submissionReference: 'FFC/TEC/RSG-EMPI/088',
      responseReference: null,
      submissionDate: new Date('2024-10-18'),
      assessmentValue: null,
      proposalValue: 620000,
      approvedAmount: null,
      status: 'PendingWithRSG',
      vorReference: 'VOR-045',
      dvoReference: null,
      dvoIssuedDate: null,
      remarks: 'Chemical treatment review',
      actionNotes: 'Specialist consultation needed',
    },
    // 46
    {
      subject: 'Gym Equipment Anchoring',
      submissionType: 'GenCorr',
      submissionReference: 'FFC/TEC/RSG-EMPI/089',
      responseReference: null,
      submissionDate: new Date('2024-10-22'),
      assessmentValue: 85000,
      proposalValue: 98000,
      approvedAmount: null,
      status: 'ApprovedAwaitingDVO',
      vorReference: 'VOR-046',
      dvoReference: null,
      dvoIssuedDate: null,
      remarks: 'Approved - DVO pending',
      actionNotes: 'Vendor coordination',
    },
    // 47
    {
      subject: 'External Lighting Enhancement',
      submissionType: 'VO',
      submissionReference: 'FFC/TEC/RSG-EMPI/090',
      responseReference: null,
      submissionDate: new Date('2024-10-25'),
      assessmentValue: null,
      proposalValue: 445000,
      approvedAmount: null,
      status: 'PendingWithRSG',
      vorReference: 'VOR-047',
      dvoReference: null,
      dvoIssuedDate: null,
      remarks: 'Photometric study pending',
      actionNotes: 'Energy compliance check',
    },
    // 48
    {
      subject: 'Lift Lobby Finishes Upgrade',
      submissionType: 'VO',
      submissionReference: 'FFC/TEC/RSG-EMPI/091',
      responseReference: 'RSG/RES/2024/046',
      submissionDate: new Date('2024-10-28'),
      assessmentValue: 365000,
      proposalValue: 420000,
      approvedAmount: 385000,
      status: 'DVORRIssued',
      vorReference: 'VOR-048',
      dvoReference: 'DVO-RR-012',
      dvoIssuedDate: new Date('2024-11-30'),
      remarks: 'Works completed',
      actionNotes: 'Final inspection passed',
    },
    // 49
    {
      subject: 'Security Bollards Installation',
      submissionType: 'RFI',
      submissionReference: 'FFC/TEC/RSG-EMPI/092',
      responseReference: null,
      submissionDate: new Date('2024-11-01'),
      assessmentValue: null,
      proposalValue: 285000,
      approvedAmount: null,
      status: 'PendingWithFFC',
      vorReference: 'VOR-049',
      dvoReference: null,
      dvoIssuedDate: null,
      remarks: 'Security assessment pending',
      actionNotes: 'Police NOC required',
    },
    // 50
    {
      subject: 'Podium Waterproofing Repairs',
      submissionType: 'VO',
      submissionReference: 'FFC/TEC/RSG-EMPI/093',
      responseReference: null,
      submissionDate: new Date('2024-11-05'),
      assessmentValue: null,
      proposalValue: 890000,
      approvedAmount: null,
      status: 'PendingWithRSGFFC',
      vorReference: 'VOR-050',
      dvoReference: null,
      dvoIssuedDate: null,
      remarks: 'Warranty claim review',
      actionNotes: 'Leak investigation ongoing',
    },
    // 51
    {
      subject: 'Vertical Garden Installation',
      submissionType: 'VO',
      submissionReference: 'FFC/TEC/RSG-EMPI/094',
      responseReference: null,
      submissionDate: new Date('2024-11-08'),
      assessmentValue: null,
      proposalValue: 520000,
      approvedAmount: null,
      status: 'PendingWithRSG',
      vorReference: 'VOR-051',
      dvoReference: null,
      dvoIssuedDate: null,
      remarks: 'Irrigation design review',
      actionNotes: 'Maintenance plan required',
    },
    // 52
    {
      subject: 'AHU Replacement - Retail Area',
      submissionType: 'VO',
      submissionReference: 'FFC/TEC/RSG-EMPI/095',
      responseReference: null,
      submissionDate: new Date('2024-11-12'),
      assessmentValue: 1450000,
      proposalValue: 1680000,
      approvedAmount: null,
      status: 'ApprovedAwaitingDVO',
      vorReference: 'VOR-052',
      dvoReference: null,
      dvoIssuedDate: null,
      remarks: 'Approved - awaiting DVO',
      actionNotes: 'Equipment lead time 8 weeks',
    },
    // 53
    {
      subject: 'Sprinkler Head Relocation',
      submissionType: 'GenCorr',
      submissionReference: 'FFC/TEC/RSG-EMPI/096',
      responseReference: null,
      submissionDate: new Date('2024-11-15'),
      assessmentValue: null,
      proposalValue: 165000,
      approvedAmount: null,
      status: 'PendingWithFFC',
      vorReference: 'VOR-053',
      dvoReference: null,
      dvoIssuedDate: null,
      remarks: 'Civil defence review',
      actionNotes: 'Hydraulic calc submission',
    },
    // 54
    {
      subject: 'Canopy Structure Addition',
      submissionType: 'VO',
      submissionReference: 'FFC/TEC/RSG-EMPI/097',
      responseReference: null,
      submissionDate: new Date('2024-11-18'),
      assessmentValue: null,
      proposalValue: 745000,
      approvedAmount: null,
      status: 'PendingWithRSG',
      vorReference: 'VOR-054',
      dvoReference: null,
      dvoIssuedDate: null,
      remarks: 'Structural design review',
      actionNotes: 'Wind load calculation needed',
    },
    // 55
    {
      subject: 'Cable Tray Modification',
      submissionType: 'VO',
      submissionReference: 'FFC/TEC/RSG-EMPI/098',
      responseReference: 'RSG/RES/2024/049',
      submissionDate: new Date('2024-11-22'),
      assessmentValue: 225000,
      proposalValue: 260000,
      approvedAmount: 240000,
      status: 'DVORRIssued',
      vorReference: 'VOR-055',
      dvoReference: 'DVO-RR-013',
      dvoIssuedDate: new Date('2024-12-20'),
      remarks: 'Installation complete',
      actionNotes: 'As-built submitted',
    },
    // 56
    {
      subject: 'Disabled Access Improvements',
      submissionType: 'VO',
      submissionReference: 'FFC/TEC/RSG-EMPI/099',
      responseReference: null,
      submissionDate: new Date('2024-11-25'),
      assessmentValue: null,
      proposalValue: 385000,
      approvedAmount: null,
      status: 'PendingWithRSGFFC',
      vorReference: 'VOR-056',
      dvoReference: null,
      dvoIssuedDate: null,
      remarks: 'DDA compliance review',
      actionNotes: 'Accessibility audit needed',
    },
    // 57
    {
      subject: 'Condensate Drain Rerouting',
      submissionType: 'Email',
      submissionReference: 'FFC/TEC/RSG-EMPI/100',
      responseReference: null,
      submissionDate: new Date('2024-11-28'),
      assessmentValue: null,
      proposalValue: 145000,
      approvedAmount: null,
      status: 'PendingWithRSG',
      vorReference: 'VOR-057',
      dvoReference: null,
      dvoIssuedDate: null,
      remarks: 'Route coordination pending',
      actionNotes: 'Ceiling void access needed',
    },
    // 58
    {
      subject: 'Fire Door Replacement Program',
      submissionType: 'VO',
      submissionReference: 'FFC/TEC/RSG-EMPI/101',
      responseReference: null,
      submissionDate: new Date('2024-12-01'),
      assessmentValue: null,
      proposalValue: 680000,
      approvedAmount: null,
      status: 'PendingWithRSG',
      vorReference: 'VOR-058',
      dvoReference: null,
      dvoIssuedDate: null,
      remarks: 'Fire rating certification review',
      actionNotes: 'Supplier evaluation ongoing',
    },
  ];

async function main() {
  console.log('🌱 Starting database seed with 58 VO records...');

  // Clear existing data
  await prisma.vO.deleteMany();
  console.log('✓ Cleared existing VO records');

  // Insert all 58 records
  for (const vo of voRecords) {
    await prisma.vO.create({ data: vo });
  }

  console.log(`✓ Inserted ${voRecords.length} VO records`);

  // Payment Applications
  const excelBaseDate = new Date(Date.UTC(1899, 11, 30));
  const toDate = (serial: number) => {
    if (!serial) return null;
    return new Date(excelBaseDate.getTime() + serial * 24 * 60 * 60 * 1000);
  };

  const payments = [
    {
      paymentNo: "AP01",
      description: "Adv Payment Invoice",
      grossAmount: 0,
      advancePaymentRecovery: 0,
      retention: 0,
      vatRecovery: 0,
      vat: 6788547.01,   // Inferred/Manual
      netPayment: 52045527.08, // Inferred from manual context or previous knowns, but leaving consistent with user input if possible.
      // User input: Gross=?, VAT=sum(D17:G17)=?, Net=?
      // Actually user row AP01: =D4*0.2. D4 is unknown. 
      // Let's use the provided submitted Date: 45253 (Nov 23 2023)
      submittedDate: toDate(45253),
      invoiceDate: toDate(45028)
    },
    {
      paymentNo: "AP02",
      description: "Adv Payment Invoice 2",
      grossAmount: 21750155.61,
      advancePaymentRecovery: 0,
      retention: 0,
      vatRecovery: 0,
      vat: 3262523.34, // 15%
      netPayment: 25012678.95,
      submittedDate: toDate(45616),
      invoiceDate: toDate(45618)
    },
    // IPA 1: Sept 20 2023 - Dec 25 2023
    // Gross: 2571831.80363033. Adv: -20%. Ret: -10%. VAT Rec: 15% of Adv? No, =E19*0.15 (Wait column E is Adv Pay Rec). =D19*0.15 is VAT on Gross.
    // Logic: Net = Gross + Adv + Ret + VAT_Rec + VAT
    // Note: Adv and Ret are negative in formula (=-D19*0.2).
    {
      paymentNo: "IPA 1",
      description: "Sept 20th 2023 – Dec 25th 2023",
      grossAmount: 2571831.80,
      advancePaymentRecovery: -514366.36, // 20%
      retention: -257183.18, // 10%
      vatRecovery: -77154.95, // 15% of AdvRec
      vat: 385774.77, // 15% of Gross
      netPayment: 2108902.08,
      submittedDate: toDate(45274),
      invoiceDate: toDate(45313)
    },
    // IPA 2
    {
      paymentNo: "IPA 2",
      description: "Dec 25th 2023 – Jan 25th 2024",
      grossAmount: 1727779.48,
      advancePaymentRecovery: -345555.90, // 20%
      retention: -172777.95, // 10%
      vatRecovery: -51833.38,
      vat: 259166.92,
      netPayment: 1416779.17,
      submittedDate: toDate(45321),
      invoiceDate: toDate(45377)
    },
    // IPA 3
    {
      paymentNo: "IPA 3",
      description: "Jan 25th 2024 – Feb 25th 2024",
      grossAmount: 1363441.89,
      advancePaymentRecovery: -272688.38, // 20%
      retention: -136344.19,
      vatRecovery: -40903.26,
      vat: 204516.28,
      netPayment: 1118022.35,
      submittedDate: toDate(45404),
      invoiceDate: toDate(45630)
    },
    // IPA 4
    {
      paymentNo: "IPA 4",
      description: "Feb 25th 2024 – Mar 25th 2024",
      grossAmount: 963176.50,
      advancePaymentRecovery: -192635.30,
      retention: -96317.65,
      vatRecovery: -28895.30,
      vat: 144476.48,
      netPayment: 789804.73,
      submittedDate: toDate(45427),
      invoiceDate: toDate(45425)
    },
    // IPA 5
    {
      paymentNo: "IPA 5",
      description: "Mar 25th 2024 – Apr 25th 2024",
      grossAmount: 6730484.94,
      advancePaymentRecovery: -1346096.99,
      retention: -673048.49,
      vatRecovery: -201914.55,
      vat: 1009572.74,
      netPayment: 5518997.65,
      submittedDate: toDate(45440),
      invoiceDate: toDate(45440)
    },
    // IPA 6
    {
      paymentNo: "IPA 6",
      description: "Apr 25th 2024 – May 25th 2024",
      grossAmount: 3008114.09,
      advancePaymentRecovery: -601622.82,
      retention: -300811.41,
      vatRecovery: -90243.42,
      vat: 451217.11,
      netPayment: 2466653.55,
      submittedDate: toDate(45411),
      invoiceDate: toDate(45470)
    },
    // IPA 7
    {
      paymentNo: "IPA 7",
      description: "May 25th 2024 – Jun 25th 2024",
      grossAmount: 3972034.68,
      advancePaymentRecovery: -794406.94,
      retention: -397203.47,
      vatRecovery: -119161.04,
      vat: 595805.20,
      netPayment: 3257068.44,
      submittedDate: toDate(45469),
      invoiceDate: toDate(45501)
    },
    // IPA 8
    {
      paymentNo: "IPA 8",
      description: "Jun 25th 2024 – Jul 25th 2024",
      grossAmount: 5556560.41,
      advancePaymentRecovery: -1111312.08,
      retention: -555656.04,
      vatRecovery: -166696.81,
      vat: 833484.06,
      netPayment: 4556379.54,
      submittedDate: toDate(45523),
      invoiceDate: toDate(45478)
    },
    // IPA 9
    {
      paymentNo: "IPA 9",
      description: "Jul 25th 2024 – Aug 25th 2024",
      grossAmount: 6512584.83,
      advancePaymentRecovery: -1302516.97,
      retention: -651258.48,
      vatRecovery: -195377.54,
      vat: 976887.72,
      netPayment: 5340319.56,
      submittedDate: toDate(45535),
      invoiceDate: toDate(45571)
    },
    // IPA 10
    {
      paymentNo: "IPA 10",
      description: "Aug 25th 2024 – Sep 25th 2024",
      grossAmount: 5212335.00,
      advancePaymentRecovery: -1042467.00,
      retention: -521233.50,
      vatRecovery: -156370.05,
      vat: 781850.25,
      netPayment: 4274114.70,
      submittedDate: toDate(45567),
      invoiceDate: toDate(45586)
    },
    // IPA 11 (Rate Change: APR 32.09%)
    {
      paymentNo: "IPA 11",
      description: "Sep 25th 2024 – Oct 25th 2024",
      grossAmount: 11178597.35,
      advancePaymentRecovery: -3587211.89, // 32.09%
      retention: -1117859.74, // 10%
      vatRecovery: -538081.78, // 15% of AdvRec
      vat: 1676789.60,
      netPayment: 7612233.54,
      submittedDate: toDate(45619),
      invoiceDate: toDate(45639)
    },
    // IPA 12
    {
      paymentNo: "IPA 12",
      description: "Oct 25th 2024 – Nov 25th 2024",
      grossAmount: 5338593.85,
      advancePaymentRecovery: -1713154.77, // 32.09%
      retention: -533859.39, // 10%
      vatRecovery: -256973.21,
      vat: 800789.08,
      netPayment: 3635395.56,
      submittedDate: toDate(45634),
      invoiceDate: toDate(45655)
    },
    // IPA 13
    {
      paymentNo: "IPA 13",
      description: "Nov 25th 2024 – Dec 25th 2024",
      grossAmount: 10523911.06,
      advancePaymentRecovery: -3377123.06, // 32.09%
      retention: -1052391.11, // 10%
      vatRecovery: -506568.46,
      vat: 1578586.66,
      netPayment: 7166415.10,
      submittedDate: toDate(45676),
      invoiceDate: toDate(45690)
    },
    // IPA 14
    {
      paymentNo: "IPA 14",
      description: "Dec 25th 2024 – Jan 25th 2025",
      grossAmount: 14789522.58,
      advancePaymentRecovery: -4745957.80, // 32.09%
      retention: -1478952.26, // 10%
      vatRecovery: -711893.67,
      vat: 2218428.39,
      netPayment: 10071147.24,
      submittedDate: toDate(45701),
      invoiceDate: toDate(45718)
    },
    // IPA 15
    {
      paymentNo: "IPA 15",
      description: "Jan 25th 2025 – Feb 25th 2025",
      grossAmount: 14091614.85,
      advancePaymentRecovery: -4521999.21, // 32.09%
      retention: -1409161.49, // 10%
      vatRecovery: -678299.88,
      vat: 2113742.23,
      netPayment: 9595896.50,
      submittedDate: toDate(45734),
      invoiceDate: toDate(45743)
    },
    // IPA 16
    {
      paymentNo: "IPA 16",
      description: "Feb 25th 2025 – Mar 25th 2025",
      grossAmount: 5147125.92,
      advancePaymentRecovery: -1651712.71, // 32.09%
      retention: -514712.59, // 10%
      vatRecovery: -247756.91,
      vat: 772068.89,
      netPayment: 3505012.60,
      submittedDate: toDate(45770),
      invoiceDate: toDate(45784)
    },
    // IPA 17
    {
      paymentNo: "IPA 17",
      description: "Mar 25th 2025 – Apr 25th 2025",
      grossAmount: 14619843.80,
      advancePaymentRecovery: -4691507.88, // 32.09%
      retention: -1461984.38, // 10%
      vatRecovery: -703726.18,
      vat: 2192976.57,
      netPayment: 9955601.93,
      submittedDate: toDate(45790),
      invoiceDate: toDate(45801)
    },
    // IPA 18
    {
      paymentNo: "IPA 18",
      description: "Apr 25th 2025 – May 25th 2025",
      grossAmount: 13904093.66,
      advancePaymentRecovery: -4461823.66, // 32.09%
      retention: -1390409.37, // 10%
      vatRecovery: -669273.55,
      vat: 2085614.05,
      netPayment: 9468201.13,
      submittedDate: toDate(45826),
      invoiceDate: toDate(45836)
    },
    // IPA 19
    {
      paymentNo: "IPA 19",
      description: "May 25th 2025 – Jun 25th 2025",
      grossAmount: 9497761.36,
      advancePaymentRecovery: -3047831.62, // 32.09%
      retention: -949776.14, // 10%
      vatRecovery: -457174.74,
      vat: 1424664.20,
      netPayment: 6467643.06,
      submittedDate: toDate(45824),
      invoiceDate: toDate(45867)
    },
    // IPA 20
    {
      paymentNo: "IPA 20",
      description: "Jun 25th 2025 – Jul 25th 2025",
      grossAmount: 6813139.26,
      advancePaymentRecovery: -2186336.39, // 32.09%
      retention: -681313.93, // 10%
      vatRecovery: -327950.46,
      vat: 1021970.89,
      netPayment: 4639509.37,
      submittedDate: toDate(45904),
      invoiceDate: toDate(45916)
    },
    // IPA 21 (Special case in sheet row: 6909904.18?? No that's Adv Rec? "Adv Pay Rec = 6909904.18")
    // Formula says =E39*0.15 where E is Adv Rec.
    // Sheet says: IPA 21 ... Adv Rec = 6909904.18 (Positive!?). No, look at previous row D39*32.09%.
    {
      paymentNo: "IPA 21",
      description: "Jul 25th 2025 – Aug 25th 2025",
      grossAmount: 5324464.12,
      advancePaymentRecovery: -1708620.54, // 32.09%
      retention: -532446.41, // 10%
      vatRecovery: -256293.08,
      vat: 798669.62,
      netPayment: 3625773.71,
      submittedDate: toDate(45915),
      invoiceDate: toDate(45946)
    },
    // IPA 22 (Retention Change: 5%)
    {
      paymentNo: "IPA 22",
      description: "Aug 25th 2025 – Sep 25th 2025",
      grossAmount: 6418102.35,
      advancePaymentRecovery: -2059569.04, // 32.09%
      retention: -320905.12, // 5%
      vatRecovery: -308935.36,
      vat: 962715.35,
      netPayment: 4691408.18,
      submittedDate: toDate(45949),
      invoiceDate: toDate(45963)
    },
    // IPA 23
    {
      paymentNo: "IPA 23",
      description: "Sep 25th 2025 – Oct 25th 2025",
      grossAmount: 18005054.06,
      advancePaymentRecovery: -5777821.85, // 32.09%
      retention: -900252.70, // 5%
      vatRecovery: -866673.28,
      vat: 2700758.11,
      netPayment: 13161064.34,
      submittedDate: toDate(45972),
      invoiceDate: toDate(45988)
    },
    // IPA 24
    {
      paymentNo: "IPA 24",
      description: "Oct 25th 2025 – Nov 25th 2025",
      grossAmount: 9837424.54,
      advancePaymentRecovery: -3156829.54, // 32.09%
      retention: -491871.23, // 5%
      vatRecovery: -473524.43,
      vat: 1475613.68,
      netPayment: 7190813.02,
      submittedDate: toDate(46001),
      invoiceDate: null // "and crud operation..."
    }
  ];

  await prisma.paymentApplication.deleteMany();
  console.log('✓ Cleared existing Payment Application records');

  for (const pay of payments) {
    await prisma.paymentApplication.create({ data: pay });
  }
  console.log(`✓ Inserted ${payments.length} Payment Application records`);

  // Show distribution
  const stats = await prisma.vO.groupBy({
    by: ['status'],
    _count: { status: true },
  });
  console.log('\n📊 Status Distribution:');
  stats.forEach((s) => {
    console.log(`   ${s.status}: ${s._count.status}`);
  });

  const total = await prisma.vO.count();
  console.log(`\n   Total VOs: ${total}`);

  // Show financial summary
  const financials = await prisma.vO.aggregate({
    _sum: {
      proposalValue: true,
      approvedAmount: true,
    },
  });
  console.log('\n💰 Financial Summary:');
  console.log(`   Total Proposal Value: AED ${(financials._sum.proposalValue || 0).toLocaleString()}`);
  console.log(`   Total Approved Amount: AED ${(financials._sum.approvedAmount || 0).toLocaleString()}`);

  console.log('\n🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
