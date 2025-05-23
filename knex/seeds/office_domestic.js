/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
const officeDomestic = require('../constants/office_domestic');
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('office_domestic').del();
  await knex('office_domestic').insert(officeDomestic);
};
