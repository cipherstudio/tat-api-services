/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('audit_logs', function (table) {
    table.increments('id').primary();
    table.integer('user_id').unsigned().nullable();
    table
      .foreign('user_id')
      .references('id')
      .inTable('users')
      .onDelete('SET NULL');
    table.string('action').notNullable();
    table.text('details').nullable();
    table.string('ip_address').nullable();
    table.string('user_agent').nullable();
    table.string('status').defaultTo('success');
    table.string('category').defaultTo('general');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('audit_logs');
};
