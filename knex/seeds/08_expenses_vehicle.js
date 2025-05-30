/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
const expenses_vehicle = require('../constants/expenses_vehicle');
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('expenses_vehicle').del();
  await knex('expenses_vehicle').insert(expenses_vehicle);
};
