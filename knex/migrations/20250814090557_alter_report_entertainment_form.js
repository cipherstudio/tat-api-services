/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('report_entertainment_form', (table) => {
    table.string('employee_type').nullable();
    table.string('entertainment_type').nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('report_entertainment_form', (table) => {
    table.dropColumn('employee_type');
    table.dropColumn('entertainment_type');
  });
};
