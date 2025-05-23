/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
const places = require('../constants/places');

exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('places').del();
  await knex('places').insert(places);
};
