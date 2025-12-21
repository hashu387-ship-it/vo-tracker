
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const realVOs = [
    {
        subject: "MEP Works inside Villas & Clusters Bathrooms and associated Interfaces",
        submissionDate: new Date("2025-02-16"),
        submissionType: "VO",
        proposalValue: 10699031.00,
        assessmentValue: 10699031.00,
        status: "DVORRIssued",
    },
    {
        subject: "Request for Quotation/ Pricing - HW2 Maintenance of Temporary Utilities & Switch over to Permanent Power",
        submissionDate: new Date("2025-11-20"),
        submissionType: "GenCorr", // Mapped from Gen CORR
        proposalValue: 3423318.95,
        status: "PendingWithRSG",
    },
    {
        subject: "Cable Copper Price Fluctuation",
        submissionDate: new Date("2024-09-25"), // 25/09/24
        submissionType: "GenCorr",
        proposalValue: 3010759.61,
        assessmentValue: 395793.54,
        status: "PendingWithRSGFFC",
    },
    {
        subject: "Issued for Construction (IFC N1) Documents Infra",
        submissionDate: new Date("2024-09-03"), // 9/3/24
        submissionType: "VO",
        proposalValue: 3001607.58,
        status: "DVORRIssued",
    },
    {
        subject: "Embeded pressurized pipelines",
        submissionDate: new Date("2025-10-15"),
        submissionType: "GenCorr",
        proposalValue: 2891331.24,
        status: "PendingWithRSG",
    },
    {
        subject: "Cost propoal for Deisel Supply",
        submissionDate: new Date("2025-07-23"),
        submissionType: "GenCorr",
        proposalValue: 1451263.73,
        status: "PendingWithRSG",
    },
    {
        subject: "Cost Proposal For Damage No 21 Chilled Water Pipe (Zone 4, Asset 31-04B)",
        submissionDate: new Date("2025-07-22"),
        submissionType: "GenCorr",
        proposalValue: 1260532.47,
        status: "PendingWithRSG",
    },
    {
        subject: "HW2 Family Pool Enlargement",
        submissionDate: new Date("2025-09-30"),
        submissionType: "VO",
        proposalValue: 1166471.16,
        assessmentValue: 912623.79,
        approvedAmount: 912623.79,
        status: "DVORRIssued",
    },
    {
        subject: "Issued for Construction (IFC N1) Documents Buildings",
        submissionDate: new Date("2024-09-07"),
        submissionType: "VO",
        proposalValue: 1100693.07,
        status: "DVORRIssued",
    },
    {
        subject: "MEP works / Pool works at HW1 Mail",
        submissionDate: new Date(), // "Not in source", using now
        submissionType: "VO", // Assumed
        proposalValue: 1000190.94, // From approved col in text? No, it's listed in 3 columns.
        assessmentValue: 1000190.94,
        approvedAmount: 1000190.94,
        status: "ApprovedAwaitingDVO",
    },
    {
        subject: "Type of Air Outlets Change from SLD to FBD by ID - All FOH Buildings",
        submissionDate: new Date("2025-10-29"),
        submissionType: "VO",
        proposalValue: 768866.49,
        status: "PendingWithRSG",
    },
    {
        subject: "Provision of Temporary Cooling to First In Place Assets",
        submissionDate: new Date("2025-07-19"),
        submissionType: "VO",
        proposalValue: 669692.26,
        assessmentValue: 372927.79,
        approvedAmount: 372927.79,
        status: "DVORRIssued",
    },
    {
        subject: "Sewage Network final Tie-in to PPP Manhole - Additional Lift Station",
        submissionDate: new Date("2025-05-19"),
        submissionType: "VO",
        proposalValue: 635771.67,
        assessmentValue: 519455.46,
        approvedAmount: 519455.46,
        status: "DVORRIssued",
    },
    {
        subject: "Supply and Installation of (Direct-buried type) Valve for Potable Water & Irrigation System",
        submissionDate: new Date("2025-12-14"),
        submissionType: "VO",
        proposalValue: 631521.67,
        status: "PendingWithRSG",
    },
    {
        subject: "Issued for Construction (IFC N1) Documents Pool",
        submissionDate: new Date("2024-09-04"),
        submissionType: "VO",
        proposalValue: 558521.84,
        status: "DVORRIssued",
    },
    {
        subject: "Cost Proposal for the operation and maintenance of temporary MEP supplies in HW03 & HW04",
        submissionDate: new Date("2025-08-30"),
        submissionType: "GenCorr",
        proposalValue: 423764.00,
        status: "PendingWithRSG",
    },
    {
        subject: "Cost proposal for Change in Bollard Lighting Fixtures luminaire ref. LA1",
        submissionDate: new Date("2025-06-24"),
        submissionType: "VO",
        proposalValue: 318771.22,
        assessmentValue: -273227.40,
        status: "PendingWithRSGFFC",
    },
    {
        subject: "HW2C05 Ligting Control System",
        submissionDate: new Date("2025-02-18"),
        submissionType: "VO",
        proposalValue: 304785.68,
        assessmentValue: 74452.02,
        status: "PendingWithRSGFFC",
    },
    {
        subject: "MEP provisions related to the cocoon water feature in the reception area of the Arrival building (Asset-10).",
        submissionDate: new Date("2025-11-16"),
        submissionType: "VO",
        proposalValue: 300617.66,
        status: "PendingWithRSG",
    },
    {
        subject: "RE: GW Light fitting to Villa terraces - Request for Quotation/Pricing",
        submissionDate: new Date("2025-11-26"),
        submissionType: "Email",
        proposalValue: 270716.16,
        status: "PendingWithRSG",
    },
    {
        subject: "Connection of Pool Overflow Drain to Sump Pit instead of Manhole",
        submissionDate: new Date("2025-08-06"),
        submissionType: "VO",
        proposalValue: 194460.10,
        assessmentValue: 85383.54,
        status: "PendingWithRSGFFC",
    },
    {
        subject: "MEP related changes to the cabanas",
        submissionDate: new Date("2025-09-22"),
        submissionType: "VO",
        proposalValue: 184530.84,
        status: "PendingWithRSG",
    },
    {
        subject: "RFI-Change in Air Outlet Type and Size for Asset 60 (HOH) and Asset 61 (Utility Hub)",
        submissionDate: new Date("2025-11-09"),
        submissionType: "RFI",
        proposalValue: 179556.66,
        status: "PendingWithRSG",
    },
    {
        subject: "Exterior Lighting Installation",
        submissionDate: new Date("2025-11-19"),
        submissionType: "Email",
        proposalValue: 177732.09,
        status: "PendingWithRSG",
    },
    {
        subject: "Reduction of the primary irrigation loop along with Points of Connections (POCs)",
        submissionDate: new Date("2025-02-03"),
        submissionType: "VO",
        proposalValue: 174014.11,
        assessmentValue: -35608.36,
        status: "PendingWithRSGFFC",
    },
    {
        subject: "Re: TMV location change in HW2 villas pantry",
        submissionDate: new Date("2025-11-06"),
        submissionType: "GenCorr",
        proposalValue: 152696.30,
        status: "PendingWithRSG",
    },
    {
        subject: "MEP works required due to relocation of Villa External Areas Showers",
        submissionDate: new Date("2025-10-18"),
        submissionType: "VO",
        proposalValue: 102059.80,
        status: "PendingWithRSG",
    },
    {
        subject: "Supply and installation of the required missing kitchen drainage pipelines in the Kitchen Areas at Amenity & HOH buildings",
        submissionDate: new Date("2025-11-10"),
        submissionType: "VO",
        proposalValue: 100533.74,
        status: "PendingWithRSG",
    },
    {
        subject: "Kitchen Drainage Pipe Installation",
        submissionDate: new Date("2025-02-05"),
        submissionType: "GenCorr",
        proposalValue: 95183.74,
        status: "PendingWithRSG",
    },
    {
        subject: "Omission of 13A twin socket outlets and Replace with combined MEP and ELV Faceplates",
        submissionDate: new Date("2025-07-20"),
        submissionType: "VO",
        proposalValue: 81841.95,
        assessmentValue: 46879.80,
        status: "PendingWithRSGFFC",
    },
    {
        subject: "MEP related works associated with the construction of the First in Place (FIP) villa pool (Asset 30-04)",
        submissionDate: new Date("2025-10-05"),
        submissionType: "VO",
        proposalValue: 58252.90,
        status: "PendingWithRSG",
    },
    {
        subject: "Additional Fire Suppression system in the Signature Restaurant",
        submissionDate: new Date("2025-06-19"),
        submissionType: "VO",
        proposalValue: 45143.47,
        assessmentValue: 7557.19,
        status: "PendingWithRSGFFC",
    },
    {
        subject: "Change from 13A single switch outlet to 13A twin switched socket outlet for the Minibar Fridge on HW2 Villas and Clusters",
        submissionDate: new Date("2025-07-15"),
        submissionType: "VO",
        proposalValue: 19944.67,
        assessmentValue: 17343.19,
        approvedAmount: 17343.19,
        status: "DVORRIssued",
    },
    {
        subject: "Simplification of Pools Channel Detailing in 10 nr 3 Bedroom Villa Pools",
        submissionDate: new Date("2025-10-05"),
        submissionType: "VO",
        proposalValue: 18314.80,
        status: "PendingWithRSG",
    },
    {
        subject: "Change of Fire-rated Cables Buried in the Infrastructure",
        submissionDate: new Date("2025-02-15"),
        submissionType: "VO",
        proposalValue: 20153.09,
        assessmentValue: -271010.81,
        status: "PendingWithRSG",
    },
    {
        subject: "Cost Proposal for SPA - Addition of Missed Small Power and Data Requirements",
        submissionDate: new Date("2025-10-15"),
        submissionType: "VO",
        proposalValue: 18087.77,
        status: "PendingWithRSG",
    },
    {
        subject: "Supplementary Conduit and Embedded Works for speciality restaurant and long bar and pool",
        submissionDate: new Date("2024-05-27"),
        submissionType: "GenCorr",
        proposalValue: 16678.63,
        status: "PendingWithRSG",
    },
    {
        subject: "Changing ACCU Room to Storage Room in Asset 60 (HOH)",
        submissionDate: new Date("2024-09-17"),
        submissionType: "VO",
        proposalValue: 15581.88,
        status: "DVORRIssued",
    },
    {
        subject: "Main Pool Bar - Sunken Bar Drain Piping to Waste Network",
        submissionDate: new Date("2025-08-21"),
        submissionType: "VO",
        proposalValue: 10039.58,
        status: "PendingWithRSG",
    },
    {
        subject: "R06-HW2C05-Costs Proposal For Modification to Telephone Operator Room in HOH (Asset 60)",
        submissionDate: new Date("2025-03-19"),
        submissionType: "VO",
        proposalValue: 3871.55,
        status: "PendingWithRSG",
    },
    {
        subject: "Cost proposal for Omit 2Nr. of Inaccessible Wall Sockets (EE-PL38) and Replace with 2Nr Floor Box having 1Nr Outlet (Electrical Provision) at Asset-14",
        submissionDate: new Date("2025-09-25"),
        submissionType: "VO",
        proposalValue: 3242.53,
        status: "PendingWithRSG",
    },
    {
        subject: "Omission of FCU's Supplying Kitchen Preparation Rooms in HoH",
        submissionDate: new Date("2025-01-06"),
        submissionType: "VO",
        proposalValue: -3537.11,
        assessmentValue: -23701.71,
        status: "PendingWithRSGFFC",
    },
    {
        subject: "Omission of Fire Protection Inside Transformer Rooms",
        submissionDate: new Date("2025-08-25"),
        submissionType: "VO",
        proposalValue: -30297.49,
        status: "PendingWithRSG",
    },
    {
        subject: "Relocation of CCTV cameras (6 nr) to meet operational requirements",
        submissionDate: new Date("2025-01-04"),
        submissionType: "VO",
        proposalValue: -40876.88,
        status: "DVORRIssued",
    },
    {
        subject: "Omission of External Emergency Lights above Fire Hose Cabinet",
        submissionDate: new Date("2025-02-15"),
        submissionType: "VO",
        proposalValue: -76534.43,
        status: "PendingWithRSG",
    },
    {
        subject: "Omission of Fire Dampers Mounted on 1 Hour Fire Rated Walls",
        submissionDate: new Date("2025-08-02"),
        submissionType: "VO",
        proposalValue: -123292.18,
        status: "PendingWithRSG",
    },
    {
        subject: "Changing Backup Strategy to Equipment Serving ICT Rooms Instruction Reference",
        submissionDate: new Date("2025-02-04"),
        submissionType: "VO",
        proposalValue: -278670.94,
        assessmentValue: -747365.98,
        approvedAmount: -504221.15,
        status: "DVORRIssued",
    },
    {
        subject: "ETS Room Standby Equipment Removal",
        submissionDate: new Date("2024-08-06"),
        submissionType: "VO",
        proposalValue: -436711.91,
        status: "DVORRIssued",
    },
    {
        subject: "Change in Generator from Biofuel to Standard Tier 1 Diesel",
        submissionDate: new Date("2024-06-09"),
        submissionType: "VO",
        proposalValue: -1050000.00,
        status: "DVORRIssued",
    },
    { // 50
        subject: "Supply and Installation of cable containment for GSM Hybrid Cables",
        submissionDate: new Date(),
        submissionType: "VO",
        status: "PendingWithRSG",
    },
    { // 51
        subject: "Addition of external signage control panel's and ommission of the generator annunciator panel in the Fire Command Centre",
        submissionDate: new Date(),
        submissionType: "VO",
        status: "PendingWithFFC",
    },
    { // 52
        subject: "Proposed changes to ICT rooms Air Outlet type and size for Asset 10 (Arrival Hub), Asset 13 (Meeting Room) and Asset 14 (Children Center)",
        submissionDate: new Date(),
        submissionType: "RFI",
        status: "PendingWithFFC",
    },
    { // 53
        subject: "R06-HW2C05 Variation Order No. 0050 Implementation of Changes Following Operator and RSG Inspection – FIP Villa and Cluster (MEP Works)",
        submissionDate: new Date(),
        submissionType: "VO",
        status: "PendingWithFFC",
    },
    { // 54
        subject: "R06-HW2C05 Variation Order No. 046 Removal of foot wash (bib taps) on the entrance of 3 Bedroom type villas; including relocation of shower drain piping works of 3-Bedroom and 4-Bedroom",
        submissionDate: new Date(),
        submissionType: "VO",
        status: "PendingWithFFC",
    },
    { // 55
        subject: "Addition of EV Charging Station for Hotel Asset Staff Vehicles",
        submissionDate: new Date(),
        submissionType: "VO",
        status: "PendingWithFFC",
    },
    { // 56
        subject: "Replacement of FOH Panic Bar Hardware on External Doors for Assets 10, 13, 22, and 23 (MEP Works)",
        submissionDate: new Date(),
        submissionType: "VO",
        status: "PendingWithFFC",
    },
    { // 57
        subject: "Omission of Bathroom Downlights which are to be free-issued to the MEP Contractor that were supplied by the Bathroom Pod Contractor (SBW)",
        submissionDate: new Date(),
        submissionType: "VO",
        status: "PendingWithFFC",
    }
];

async function main() {
    console.log('Clearing existing data...');
    await prisma.vO.deleteMany({});

    console.log(`Seeding ${realVOs.length} real VOs...`);

    for (const vo of realVOs) {
        await prisma.vO.create({
            data: vo
        });
    }

    console.log('Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
