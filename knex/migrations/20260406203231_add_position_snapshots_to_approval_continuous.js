/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable('approval_continuous', function (table) {
    table.text('approver_position').nullable();
    table.text('created_by_position').nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable('approval_continuous', function (table) {
    table.dropColumn('approver_position');
    table.dropColumn('created_by_position');
  });
};
