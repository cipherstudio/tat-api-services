/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.alterTable('approval_clothing_expense', function(table) {
      table.string('increment_id').nullable();
      table.string('destination_country').nullable();
    });
  };
  
  /**
   * @param { import("knex").Knex } knex
   * @returns { Promise<void> }
   */
  exports.down = function(knex) {
    return knex.schema.alterTable('approval_clothing_expense', function(table) {
      table.dropColumn('increment_id');
      table.dropColumn('destination_country');
    });
  };
  