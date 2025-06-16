const countries = require('../constants/country_type_percent_increase');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  for (const country of countries) {
    await knex('countries')
      .where('code', country.code)
      .update({
        type: country.type,
        percent_increase: country.percent_increase
      });
  }
};
