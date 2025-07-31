/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable('sessions', function (table) {
    table.string('employee_code').nullable().after('user_id');
    
    // Add index for better performance
    table.index(['employee_code']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable('sessions', function (table) {
    table.dropIndex(['employee_code']);
    table.dropColumn('employee_code');
  });
}; 