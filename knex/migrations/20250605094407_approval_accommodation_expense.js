/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('approval_accommodation_expense', function(table) {
    table.increments('id').primary();
    
    table.float('total_amount').nullable();

    table.boolean('has_meal_out').defaultTo(false);
    table.boolean('has_meal_in').defaultTo(false);
    table.float('meal_out_amount').nullable();
    table.float('meal_in_amount').nullable();
    table.float('meal_out_count').nullable();
    table.float('meal_in_count').nullable();

    table.boolean('allowance_out_checked').defaultTo(false);
    table.float('allowance_out_rate').nullable();
    table.float('allowance_out_days').nullable();
    table.float('allowance_out_total').nullable();

    table.boolean('allowance_in_checked').defaultTo(false);
    table.float('allowance_in_rate').nullable();
    table.float('allowance_in_days').nullable();
    table.float('allowance_in_total').nullable();
    
    table.boolean('lodging_fixed_checked').defaultTo(false);
    table.boolean('lodging_double_checked').defaultTo(false);
    table.boolean('lodging_single_checked').defaultTo(false);
    table.float('lodging_nights').nullable();
    table.float('lodging_rate').nullable();
    table.float('lodging_double_nights').nullable();
    table.float('lodging_double_rate').nullable();
    table.float('lodging_single_nights').nullable();
    table.float('lodging_single_rate').nullable();
    table.string('lodging_double_person').nullable();
    table.string('lodging_double_person_external').nullable();
    table.float('lodging_total').nullable();

    // Transport properties
    table.boolean('transport_checked').defaultTo(false);
    table.float('transport_total').nullable();


    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.integer('staff_member_id').nullable();
    table.integer('trip_entry_id').nullable();

    table.integer('approval_id').nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('approval_accommodation_expense');
};
