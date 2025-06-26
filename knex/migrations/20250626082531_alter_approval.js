/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('approval', (table) => {
    table.string('staff_employee_code').nullable();
    table.string('final_staff_employee_code').nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('approval', (table) => {
    table.dropColumn('staff_employee_code');
    table.dropColumn('final_staff_employee_code');
  });
};
