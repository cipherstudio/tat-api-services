const countries = require('../constants/country_updated_name_th');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // Update name_th for all countries
  for (const country of countries) {
    await knex('countries')
      .where('code', country.code)
      .update({
        name_th: country.name_th
      });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  // Rollback: restore original name_th from country_type_percent_increase
  const originalCountries = require('../constants/country_type_percent_increase');
  
  for (const country of originalCountries) {
    await knex('countries')
      .where('code', country.code)
      .update({
        name_th: country.name_th
      });
  }
};

