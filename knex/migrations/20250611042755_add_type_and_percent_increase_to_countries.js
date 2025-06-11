const countries = require('../constants/country_type_percent_increase');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // Add new columns
  await knex.schema.alterTable('countries', function(table) {
    table.string('type').nullable();
    table.integer('percent_increase').defaultTo(0);
  });

  // Update data
  for (const country of countries) {
    await knex('countries')
      .where('code', country.code)
      .update({
        type: country.type,
        percent_increase: country.percent_increase
      });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('countries', function(table) {
    table.dropColumn('type');
    table.dropColumn('percent_increase');
  });
};
