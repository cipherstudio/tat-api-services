/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable('report_traveller_form', (table) => {
    table.string('report_submit_to', 500).nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable('report_traveller_form', (table) => {
    table.dropColumn('report_submit_to');
  });
};
