/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
const approvalStatus = require('../constants/approval_status');

exports.seed = async function(knex) {
  // Deletes ALL existing entries
    await knex('approval_status_labels').del()
    await knex('approval_status_labels').insert(approvalStatus);
};
