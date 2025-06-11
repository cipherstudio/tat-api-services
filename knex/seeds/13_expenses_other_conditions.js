/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
const expensesOtherConditions = require('../constants/expenses_other_condition');

exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('expenses_other_conditions').del()
  await knex('expenses_other_conditions').insert(expensesOtherConditions);
};
