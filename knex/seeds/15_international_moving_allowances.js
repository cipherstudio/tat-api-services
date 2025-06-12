/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */

const international_moving_allowances = require('../constants/international_moving_allowances');

exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('international_moving_allowances').del();
  await knex('international_moving_allowances').insert(international_moving_allowances);
};
