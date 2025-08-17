/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
const privilege = require('../constants/privilege');

exports.seed = async function(knex) {
  await knex('privilege').del();
  await knex('privilege').insert(privilege);
};
