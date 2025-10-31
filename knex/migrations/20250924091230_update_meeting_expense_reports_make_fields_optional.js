/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('meeting_expense_reports', function(table) {
    table.string('topic', 500).nullable().alter();
    table.string('place', 500).nullable().alter();
    table.string('meeting_type', 255).nullable().alter();
    table.string('attendees', 255).nullable().alter();
    table.date('meeting_date').nullable().alter();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('meeting_expense_reports', function(table) {
    table.string('topic', 500).notNullable().alter();
    table.string('place', 500).notNullable().alter();
    table.string('meeting_type', 255).notNullable().alter();
    table.string('attendees', 255).notNullable().alter();
    table.date('meeting_date').notNullable().alter();
  });
};
