/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex('employee_admin').del();

  // Inserts seed entries
  await knex('employee_admin').insert([
    {
      pmt_code: '65028',
      employee_code: '65028',
      employee_name: 'นางสาว อรกานต์ วัฒนกิตติคุณ',
      position: 'พนักงานการเงิน',
      department: '',
      division: 'Information Technology',
      section: 'System Management',
      is_active: true,
      is_suspended: false,
      created_by: 'system',
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
  ]);
};
