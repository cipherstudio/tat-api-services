/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
const committee_position = require('../constants/committee_position');
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('committee_position').del();
  await knex('committee_position').insert(committee_position);
};
