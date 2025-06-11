/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('files', function (table) {
    table.increments('id').primary();
    table.string('original_name', 600).notNullable();
    table.string('file_name', 600).notNullable().unique();
    table.string('mime_type').notNullable();
    table.integer('size').notNullable();
    table.string('path').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('files');
};
