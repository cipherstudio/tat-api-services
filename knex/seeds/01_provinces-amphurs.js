/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
const provinces = require('../constants/provinces');
const amphurs = require('../constants/amphurs');

exports.seed = async function(knex) {

  await knex('expenses_bangkok_to_place').del();
  
  // Deletes ALL existing entries
  await knex('provinces').del();
  await knex('provinces').insert(provinces);

  // Deletes ALL existing entries
  await knex('amphurs').del();
  await knex('amphurs').insert(amphurs);
};
