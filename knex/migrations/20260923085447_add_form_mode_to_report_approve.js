/**
 * #448 — Persist the "ข้อมูลผู้เดินทาง" mode chosen in step 1 of the travel
 * report: '1' = ทำเป็นรายบุคคล, '2' = ทำเป็นหมู่คณะ. It used to live only in
 * the frontend store, so reopening a saved group report showed it as
 * individual. NULL on existing rows reads as '1' (the previous default).
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable('report_approve', (table) => {
    table.string('form_mode', 1).nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable('report_approve', (table) => {
    table.dropColumn('form_mode');
  });
};
