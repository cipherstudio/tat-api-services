/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .createTable('confidential_access_control', function (table) {
      table.increments('id').primary();
      table.string('position').notNullable()
      table.enum('confidential_level', ['NORMAL', 'CONFIDENTIAL', 'SECRET', 'TOP_SECRET']).notNullable()
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      
      // Index
      table.index(['position']);
      table.index(['confidential_level']);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('confidential_access_control');
};
