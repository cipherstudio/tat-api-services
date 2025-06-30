/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
const approvalStatus = require('../constants/approval_status');

exports.seed = async function(knex) {
  // Check if data already exists
  const existingData = await knex('approval_status_labels');

  // insert data if no data exists
  if (existingData.length === 0) {
    await knex('approval_status_labels').insert(approvalStatus);
  }
};
