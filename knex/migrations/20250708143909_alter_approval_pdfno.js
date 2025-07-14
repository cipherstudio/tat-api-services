/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('approval', function(table) {
    table.string('approval_print_number').nullable();
    table.string('expense_print_number').nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('approval', function(table) {
    table.dropColumn('approval_print_number');
    table.dropColumn('expense_print_number');
  });
};
