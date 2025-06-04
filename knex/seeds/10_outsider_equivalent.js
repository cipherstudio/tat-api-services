/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
const outsider_equivalent = require('../constants/outsider_equivalent');

exports.seed = async function(knex) {
  await knex('outsider_equivalent').del();
  await knex('outsider_equivalent').insert(outsider_equivalent);
};
