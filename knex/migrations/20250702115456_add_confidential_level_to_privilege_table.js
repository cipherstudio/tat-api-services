/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('privilege', function (table) {
    table.enum('confidential_level', ['NORMAL', 'CONFIDENTIAL', 'SECRET', 'TOP_SECRET']).defaultTo('NORMAL');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('privilege', function (table) {
    table.dropColumn('confidential_level');
  });
};
