/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('report_entertainment_form', function(table) {
    table.string('employee_position', 255).nullable().alter();
    table.string('department', 255).nullable().alter();
    table.string('job', 255).nullable().alter();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('report_entertainment_form', function(table) {
    table.string('employee_position', 255).notNullable().alter();
    table.string('department', 255).notNullable().alter();
    table.string('job', 255).notNullable().alter();
  });
};
