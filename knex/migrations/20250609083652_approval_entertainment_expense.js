/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('approval_entertainment_expense', function(table) {
    table.increments('id').primary();

    table.boolean('entertainment_short_checked').defaultTo(false);
    table.boolean('entertainment_long_checked').defaultTo(false);
    table.float('entertainment_amount').nullable();

    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.integer('approval_id').nullable();
    table.integer('staff_member_id').nullable();
    table.integer('approval_accommodation_expense_id').nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('approval_entertainment_expense');
};
