/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('accommodation_rates', (table) => {
    table.enum('country_type', ['A', 'B']).nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('accommodation_rates', (table) => {
    table.dropColumn('country_type');
  });
};
