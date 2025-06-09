/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('approval_transportation_expense', function(table) {
    table.increments('id').primary();
    table.string('travel_type').nullable();
    table.string('expense_type').nullable();
    table.string('travel_method').nullable();

    table.string('outbound_origin').nullable();
    table.string('outbound_destination').nullable();
    table.string('outbound_trips').nullable();
    table.string('outbound_expense').nullable();
    table.string('outbound_total').nullable();

    table.string('inbound_origin').nullable();
    table.string('inbound_destination').nullable();
    table.string('inbound_trips').nullable();
    table.string('inbound_expense').nullable();
    table.string('inbound_total').nullable();

    table.string('total_amount').nullable();

    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.integer('staff_member_id').nullable();
    table.integer('work_location_id').nullable();
    table.integer('approval_id').nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('approval_transportation_expense');
};
