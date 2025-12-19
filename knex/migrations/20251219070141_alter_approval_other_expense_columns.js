/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('approval_other_expense', function(table) {
    table.string('type', 1000).nullable().alter();
    table.string('reason', 1000).nullable().alter();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('approval_other_expense', function(table) {
    table.string('type', 255).nullable().alter();
    table.string('reason', 255).nullable().alter();
  });
};
