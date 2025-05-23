/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
const provinces = require('../constants/provinces');
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('provinces').del();
  await knex('provinces').insert(provinces);
};


const amphurs = require('../constants/amphurs');
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('amphurs').del();
  await knex('amphurs').insert(amphurs);
};
