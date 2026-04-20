/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable('approval_accommodation_expense', (table) => {
    table.float('moving_cost_distance').nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable('approval_accommodation_expense', (table) => {
    table.dropColumn('moving_cost_distance');
  });
};
