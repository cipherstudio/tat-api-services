/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('approval_budgets', (table) => {
    table.text('strategy').nullable();
    table.text('plan').nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('approval_budgets', (table) => {
    table.dropColumn('strategy');
    table.dropColumn('plan');
  });
};
