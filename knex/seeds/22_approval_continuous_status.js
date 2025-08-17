/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
const approvalContinuousStatus = require('../constants/approval_continuous_status');

exports.seed = async function(knex) {
  // Check if data already exists
  const existingData = await knex('approval_continuous_status');

  // insert data if no data exists
  if (existingData.length === 0) {
    await knex('approval_continuous_status').insert(approvalContinuousStatus);
  }
};
