/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('report_entertainment_items', function(table) {
    table.string('venue', 255).nullable().alter();
    table.date('event_date').nullable().alter();
    table.decimal('amount', 15, 2).nullable().alter();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('report_entertainment_items', function(table) {
    table.string('venue', 255).notNullable().alter();
    table.date('event_date').notNullable().alter();
    table.decimal('amount', 15, 2).notNullable().defaultTo(0.0).alter();
  });
};
