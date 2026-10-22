/**
 * report_allowance.days was created as integer, so Oracle rounded half days
 * (meeting allowance 0.5 day, #300/#301) to 1 on save. Widen it to an
 * unconstrained NUMBER so fractional days round-trip unchanged.
 *
 * Raw SQL: knex `.alter()` on Oracle emits a precision/scale that Oracle refuses
 * to apply to a non-empty column (ORA-01440). Widening to plain NUMBER is allowed.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.raw('ALTER TABLE "report_allowance" MODIFY ("days" NUMBER)');
};

/**
 * Narrowing back needs an empty column, so copy through a temporary column.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.raw('ALTER TABLE "report_allowance" ADD ("days_int" NUMBER(38, 0))');
  await knex.raw('UPDATE "report_allowance" SET "days_int" = ROUND("days")');
  await knex.raw('ALTER TABLE "report_allowance" DROP COLUMN "days"');
  await knex.raw('ALTER TABLE "report_allowance" RENAME COLUMN "days_int" TO "days"');
};
