/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('menu_items_access', (table) => {
    table.increments('id').primary();
    table.string('key_name', 255).unique().notNullable();
    table.string('title', 255).notNullable();
    table.string('parent_key', 255);
    table.boolean('is_active').defaultTo(true);
    table.boolean('is_admin').defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('menu_items_access');
};
