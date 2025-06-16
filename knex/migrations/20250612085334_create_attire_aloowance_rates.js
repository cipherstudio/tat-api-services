/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('attire_allowance_rates', (table) => {
    table.increments('id').primary();
    table.enum('assignment_type', ['TEMPORARY', 'PERMANENT']).notNullable();
    table.string('position_group_name').nullable();
    table.text('position_name').nullable();
    table.integer('level_code_start').nullable();
    table.integer('level_code_end').nullable();
    table.enum('destination_type', ['A', 'B']).notNullable();
    table.decimal('rate_thb', 10, 2).notNullable();
    table.decimal('spouse_rate_thb', 10, 2).notNullable();
    table.decimal('child_rate_thb', 10, 2).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('attire_allowance_rates');
};
