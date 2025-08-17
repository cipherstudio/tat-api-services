/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('approval_accommodation_expense', function(table) {
    // International allowance columns
    table.boolean('allowance_abroad_flat_checked').defaultTo(false);
    table.boolean('allowance_abroad_actual_checked').defaultTo(false);
    table.float('allowance_abroad_flat_rate').nullable();
    table.float('allowance_abroad_actual_rate').nullable();
    table.float('allowance_abroad_days').nullable();
    table.float('allowance_abroad_total').nullable();

    // International meal columns
    table.boolean('has_meal_abroad_flat').defaultTo(false);
    table.boolean('has_meal_abroad_actual').defaultTo(false);
    table.float('meal_abroad_flat_count').nullable();
    table.float('meal_abroad_actual_count').nullable();
    table.float('meal_abroad_flat_amount').nullable();
    table.float('meal_abroad_actual_amount').nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('approval_accommodation_expense', function(table) {
    // Drop international allowance columns
    table.dropColumn('allowance_abroad_flat_checked');
    table.dropColumn('allowance_abroad_actual_checked');
    table.dropColumn('allowance_abroad_flat_rate');
    table.dropColumn('allowance_abroad_actual_rate');
    table.dropColumn('allowance_abroad_days');
    table.dropColumn('allowance_abroad_total');

    // Drop international meal columns
    table.dropColumn('has_meal_abroad_flat');
    table.dropColumn('has_meal_abroad_actual');
    table.dropColumn('meal_abroad_flat_count');
    table.dropColumn('meal_abroad_actual_count');
    table.dropColumn('meal_abroad_flat_amount');
    table.dropColumn('meal_abroad_actual_amount');
  });
};
