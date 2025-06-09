/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('approval_budgets', function(table) {
    table.increments('id').primary();

    table.string('budget_type').nullable();
    table.string('item_type').nullable();
    table.string('reservation_code').nullable();
    table.string('department').nullable();
    table.string('budget_code').nullable();

    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.integer('approval_id').nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('approval_budgets');
};
