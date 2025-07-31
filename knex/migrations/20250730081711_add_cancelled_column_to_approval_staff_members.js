/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('approval_staff_members', function(table) {
    table.boolean('cancelled').defaultTo(false)
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('approval_staff_members', function(table) {
    table.dropColumn('cancelled');
  });
};
