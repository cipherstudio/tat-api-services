/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable('report_approve', (table) => {
    table.string('last_selected_traveler_code', 100).nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable('report_approve', (table) => {
    table.dropColumn('last_selected_traveler_code');
  });
};

