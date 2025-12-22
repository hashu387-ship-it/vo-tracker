
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Finding VO with value ~1,000,191...');

    // Find the VO based on the user's description and value
    // "MEP works / Pool works at HW1" - SAR 1,000,191

    const vos = await prisma.vO.findMany({
        where: {
            OR: [
                { proposalValue: 1000191 },
                { subject: { contains: 'Pool', mode: 'insensitive' } },
                { subject: { contains: 'MEP', mode: 'insensitive' } }
            ]
        }
    });

    console.log(`Found ${vos.length} potential matches.`);

    for (const vo of vos) {
        if (vo.proposalValue === 1000191 || (vo.proposalValue && Math.abs(vo.proposalValue - 1000191) < 1)) {
            console.log(`Excluding VO ID: ${vo.id}, Subject: "${vo.subject}", Value: ${vo.proposalValue}`);
            await prisma.vO.update({
                where: { id: vo.id },
                data: { isExcludedFromStats: true }
            });
            console.log('Done.');
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
