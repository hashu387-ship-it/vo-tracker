
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
    console.log('Clearing existing data...');
    await prisma.vO.deleteMany({});

    const dataPath = path.join(__dirname, 'real-data.json');
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const realVOs = JSON.parse(rawData);

    console.log(`Seeding ${realVOs.length} real VOs...`);

    for (const vo of realVOs) {
        if (!vo.subject) continue;

        // Ensure date strings are converted back to Date objects
        const dataToCreate = {
            ...vo,
            submissionDate: new Date(vo.submissionDate),
        };

        // Remove temporary keys if any (none expected from parser)

        await prisma.vO.create({
            data: dataToCreate
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
