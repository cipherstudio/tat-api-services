/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
const EXPENSES_BANGKOK_TO_PLACE = require('../constants/expenses_bangkok_to_place');

exports.seed = async function(knex) {
  await knex('expenses_bangkok_to_place').insert(EXPENSES_BANGKOK_TO_PLACE);
};
