/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('approval_accommodation_transport_expense', function(table) {
    table.increments('id').primary();
    table.string('type').nullable();
    table.float('amount').nullable();
    table.boolean('checked').defaultTo(false);
    table.string('flight_route').nullable();

    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.integer('approval_accommodation_expense_id').nullable();
    table.integer('approval_id').nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('approval_accommodation_transport_expense');
};
