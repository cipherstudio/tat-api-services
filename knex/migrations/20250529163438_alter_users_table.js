/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  //add column employee_code to admin table
  return knex.schema.alterTable('users', function (table) {
    table.string('employee_code').nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable('users', function (table) {
    table.dropColumn('employee_code');
  });
};
