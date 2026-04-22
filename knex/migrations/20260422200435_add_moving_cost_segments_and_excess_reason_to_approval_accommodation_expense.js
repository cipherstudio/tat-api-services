/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable('approval_accommodation_expense', (table) => {
    table.text('moving_cost_segments').nullable();
    table.text('moving_excess_account_3_reason').nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable('approval_accommodation_expense', (table) => {
    table.dropColumn('moving_cost_segments');
    table.dropColumn('moving_excess_account_3_reason');
  });
};
