/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
const per_diem_rates = require('../constants/per_diem_rates');

exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('per_diem_rates').del();
  await knex('per_diem_rates').insert(per_diem_rates);
};
