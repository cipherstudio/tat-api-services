/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('countries', (table) => {
    table.increments('id').primary();
    table.string('code').notNullable();
    table.string('name_en').notNullable();
    table.string('name_th').notNullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('countries');
};
