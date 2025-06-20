/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex('report_approve_status').del();

  // Inserts seed entries
  await knex('report_approve_status').insert([
    {
      id: 1,
      status: 'Draft',
      description: 'Report is in draft state',
      is_active: true,
    },
    {
      id: 2,
      status: 'Pending',
      description: 'Report is pending approval',
      is_active: true,
    },
    {
      id: 3,
      status: 'Approved',
      description: 'Report has been approved',
      is_active: true,
    },
    {
      id: 4,
      status: 'Rejected',
      description: 'Report has been rejected',
      is_active: true,
    },
    {
      id: 5,
      status: 'Cancelled',
      description: 'Report has been cancelled',
      is_active: true,
    },
  ]);
};
