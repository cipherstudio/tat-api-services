/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .createTable('holiday_work_rates', function (table) {
      table.increments('id').primary();
      table.decimal('step_level', 4, 2).notNullable();
      table.decimal('salary', 10, 2).notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    })
    .then(function () {
      return knex.schema.createTable('holiday_work_hours', function (table) {
        table.increments('id').primary();
        table
          .integer('rate_id')
          .notNullable()
          .references('id')
          .inTable('holiday_work_rates')
          .onDelete('CASCADE');
        table.integer('hour').notNullable().checkBetween([1, 8]);
        table.decimal('work_pay', 10, 2).notNullable();
        table.decimal('tax_rate', 10, 2).notNullable().defaultTo(0);
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
      });
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists('holiday_work_hours')
    .dropTableIfExists('holiday_work_rates');
};
