import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Status distribution based on image:
// Pending with FFC: 7
// Pending with RSG: 28
// Pending with RSG/FFC: 9
// Approved & Awaiting DVO: 0
// DVO RR Issued: 13
// Total: 50 (we'll use actual 50)

const subjects = [
  'Structural Steel Reinforcement',
  'HVAC Ductwork Modification',
  'Electrical Panel Upgrade',
  'Fire Alarm System Extension',
  'Plumbing Rerouting Works',
  'Facade Cladding Revision',
  'Foundation Strengthening',
  'Waterproofing Enhancement',
  'MEP Coordination Changes',
  'Ceiling Grid Modification',
  'Floor Finish Upgrade',
  'Wall Partition Relocation',
  'Drainage System Extension',
  'Lighting Layout Changes',
  'CCTV Installation Addition',
  'Access Control Upgrade',
  'Parking Barrier Installation',
  'Landscape Irrigation Mod',
  'Roof Insulation Addition',
  'Staircase Handrail Change',
  'Elevator Pit Modification',
  'Generator Room Expansion',
  'Chiller Plant Upgrade',
  'BMS Integration Works',
  'Kitchen Extract System',
  'Data Center Cooling',
  'Substation Relocation',
  'Water Tank Expansion',
  'Fire Pump Room Works',
  'Loading Bay Modification',
];

const sampleVOs: Array<{
  subject: string;
  submissionType: string;
  submissionReference: string;
  responseReference: string | null;
  submissionDate: Date;
  assessmentValue: number;
  proposalValue: number;
  approvedAmount: number | null;
  status: string;
  vorReference: string | null;
  dvoReference: string | null;
  dvoIssuedDate: Date | null;
  remarks: string;
  actionNotes: string | null;
}> = [];

let voCounter = 1;

// Pending with FFC (7)
for (let i = 0; i < 7; i++) {
  sampleVOs.push({
    subject: `${subjects[i % subjects.length]} - Zone ${String.fromCharCode(65 + i)}`,
    submissionType: 'VO',
    submissionReference: `VO-${String(voCounter).padStart(3, '0')}-2024`,
    responseReference: null,
    submissionDate: new Date(2024, Math.floor(i / 3), (i % 28) + 1),
    assessmentValue: 80000 + i * 25000,
    proposalValue: 90000 + i * 28000,
    approvedAmount: null,
    status: 'PendingWithFFC',
    vorReference: `VOR-${String(voCounter).padStart(3, '0')}`,
    dvoReference: null,
    dvoIssuedDate: null,
    remarks: 'Under FFC technical review',
    actionNotes: 'Awaiting FFC response',
  });
  voCounter++;
}

// Pending with RSG (28)
for (let i = 0; i < 28; i++) {
  sampleVOs.push({
    subject: `${subjects[(i + 7) % subjects.length]} - Block ${Math.floor(i / 7) + 1}`,
    submissionType: i % 4 === 0 ? 'GenCorr' : 'VO',
    submissionReference: `VO-${String(voCounter).padStart(3, '0')}-2024`,
    responseReference: null,
    submissionDate: new Date(2024, Math.floor(i / 10), (i % 28) + 1),
    assessmentValue: 50000 + i * 12000,
    proposalValue: 55000 + i * 13000,
    approvedAmount: null,
    status: 'PendingWithRSG',
    vorReference: `VOR-${String(voCounter).padStart(3, '0')}`,
    dvoReference: null,
    dvoIssuedDate: null,
    remarks: 'Under RSG technical assessment',
    actionNotes: 'Awaiting RSG evaluation',
  });
  voCounter++;
}

// Pending with RSG/FFC (9)
for (let i = 0; i < 9; i++) {
  sampleVOs.push({
    subject: `${subjects[(i + 15) % subjects.length]} - Interface Area ${i + 1}`,
    submissionType: 'VO',
    submissionReference: `VO-${String(voCounter).padStart(3, '0')}-2024`,
    responseReference: null,
    submissionDate: new Date(2024, 2, (i % 28) + 1),
    assessmentValue: 120000 + i * 30000,
    proposalValue: 135000 + i * 33000,
    approvedAmount: null,
    status: 'PendingWithRSGFFC',
    vorReference: `VOR-${String(voCounter).padStart(3, '0')}`,
    dvoReference: null,
    dvoIssuedDate: null,
    remarks: 'Joint RSG/FFC review required',
    actionNotes: 'Pending dual approval',
  });
  voCounter++;
}

// Approved & Awaiting DVO (0) - as per image

// DVO RR Issued (6 - adjusted to make total 50)
for (let i = 0; i < 6; i++) {
  sampleVOs.push({
    subject: `${subjects[(i + 24) % subjects.length]} - Completed Phase ${i + 1}`,
    submissionType: 'VO',
    submissionReference: `VO-${String(voCounter).padStart(3, '0')}-2024`,
    responseReference: `RSP-${String(i + 1).padStart(3, '0')}`,
    submissionDate: new Date(2024, 0, (i * 4) + 1),
    assessmentValue: 200000 + i * 50000,
    proposalValue: 220000 + i * 55000,
    approvedAmount: 210000 + i * 52000,
    status: 'DVORRIssued',
    vorReference: `VOR-${String(voCounter).padStart(3, '0')}`,
    dvoReference: `DVO-RR-${String(i + 1).padStart(3, '0')}`,
    dvoIssuedDate: new Date(2024, 1, (i * 3) + 5),
    remarks: 'DVO RR issued - payment processed',
    actionNotes: 'Complete',
  });
  voCounter++;
}

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  await prisma.vO.deleteMany();
  console.log('✓ Cleared existing VO records');

  // Insert sample data
  for (const vo of sampleVOs) {
    await prisma.vO.create({ data: vo });
  }

  console.log(`✓ Inserted ${sampleVOs.length} sample VO records`);

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
  console.log(`   Total Submitted VO: ${total}`);

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
