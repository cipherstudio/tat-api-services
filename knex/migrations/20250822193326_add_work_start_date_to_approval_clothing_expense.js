/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.table('approval_clothing_expense', function(table) {
    table.string('work_start_date').nullable()
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.table('approval_clothing_expense', function(table) {
    table.dropColumn('work_start_date');
  });
};
