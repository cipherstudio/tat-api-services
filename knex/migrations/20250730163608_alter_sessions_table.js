/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.hasTable('sessions', (table) => {
    if (!table.hasColumn('employee_code')) {
      table.string('employee_code').nullable();
    }
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.hasTable('sessions', (table) => {
    if (table.hasColumn('employee_code')) {
      table.dropColumn('employee_code');
    }
  });
};
