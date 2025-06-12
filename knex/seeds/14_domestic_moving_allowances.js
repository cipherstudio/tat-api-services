/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */

const domestic_moving_allowances = require('../constants/domestic_moving_allowances');

exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('domestic_moving_allowances').del();
  await knex('domestic_moving_allowances').insert(domestic_moving_allowances);
};
