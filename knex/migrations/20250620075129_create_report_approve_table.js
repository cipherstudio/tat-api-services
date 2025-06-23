/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('report_approve', (table) => {
    table.increments('id').primary();
    table.string('title', 255).nullable();
    table.string('creator_name', 255).nullable();
    table.string('creator_code', 100).nullable();
    table.string('document_number', 100).nullable();
    table.integer('approve_id').nullable();
    table.integer('status').nullable().defaultTo(1);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('report_approve');
};
