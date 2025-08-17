/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
const countries = require('../constants/countries');

exports.seed = async function(knex) {
  await knex('office_international').del();

  // Deletes ALL existing entries
  await knex('countries').del()
  await knex('countries').insert(countries);
};
