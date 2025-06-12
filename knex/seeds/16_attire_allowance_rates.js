const attire_allowance_rates = require('../constants/attire_allowance_rates');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('attire_allowance_rates').del();
  await knex('attire_allowance_rates').insert(attire_allowance_rates[0]);
};
