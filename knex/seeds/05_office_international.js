/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
const officeInternational = require('../constants/office_international');

exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('office_international').del()
  await knex('office_international').insert(officeInternational);
};
