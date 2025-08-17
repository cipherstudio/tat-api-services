/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.alterTable('approval', function(table) {
      table.string('created_employee_code').nullable();
      table.string('created_employee_name').nullable();
    });
  };
  
  /**
   * @param { import("knex").Knex } knex
   * @returns { Promise<void> }
   */
  exports.down = function(knex) {
    return knex.schema.alterTable('approval', function(table) {
      table.dropColumn('created_employee_code');
      table.dropColumn('created_employee_name');
    });
  };
  