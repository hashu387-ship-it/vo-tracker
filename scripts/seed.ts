/**
 * CLI seeder: `npm run db:seed`.
 *
 * The app seeds itself on first read, so this is only needed when you want to
 * force the register back to the checked-in workbook extract.
 */
import { computePaymentPosition, computeVariationPosition } from '../lib/domain/calc';
import { moneyWithUnit, percent } from '../lib/domain/money';
import { buildPaymentRows, buildProjectRow, buildVariationRows, seed } from '../lib/db/seed';

async function main() {
  const counts = await seed({ reset: true });

  const project = buildProjectRow();
  const variations = buildVariationRows().map((v) => ({ ...v, updatedAt: v.updatedAt })) as never[];
  const payments = buildPaymentRows() as never[];

  const paymentPosition = computePaymentPosition(project as never, payments);
  const variationPosition = computeVariationPosition(variations);

  console.log(`Seeded ${counts.variations} variations and ${counts.payments} certificates.\n`);
  console.log(`  Revised contract   ${moneyWithUnit(project.revisedContractValue)}`);
  console.log(
    `  Work done          ${moneyWithUnit(paymentPosition.totalWorkDone)}  (${percent(paymentPosition.percentComplete)})`,
  );
  console.log(`  Received           ${moneyWithUnit(paymentPosition.received)}`);
  console.log(`  Outstanding        ${moneyWithUnit(paymentPosition.outstanding)}`);
  console.log(`  Retention held     ${moneyWithUnit(paymentPosition.retentionDeducted)}`);
  console.log(`  Advance balance    ${moneyWithUnit(paymentPosition.advanceBalance)}`);
  console.log(`  Variations value   ${moneyWithUnit(variationPosition.totalValue)}`);
}

main().then(
  () => process.exit(0),
  (error) => {
    console.error(error);
    process.exit(1);
  },
);
