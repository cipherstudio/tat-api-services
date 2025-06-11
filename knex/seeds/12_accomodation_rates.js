/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */

const accommodation_rates = require('../constants/accommodation_rates');

exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('accommodation_rates').del();
  await knex('accommodation_rates').insert(accommodation_rates);
};
