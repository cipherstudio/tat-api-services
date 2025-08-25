/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('clothing_expense_cancellation_requests', function(table) {
    table.increments('id').primary();
    table.integer('approval_id').notNullable().references('id').inTable('approval').onDelete('CASCADE');
    table.integer('attachment_id').nullable().references('id').inTable('files').onDelete('SET NULL');
    table.text('comment').nullable();
    table.string('creator_code').notNullable();
    table.string('creator_name').notNullable();
    table.string('status').notNullable().defaultTo('pending'); // pending, approved, rejected
    table.json('selected_staff_ids').nullable();
    table.timestamps(true, true);
    table.index(['approval_id']);
    table.index(['creator_code']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('clothing_expense_cancellation_requests');
};
