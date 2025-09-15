/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  const reportSettings = [
    {
      report_name: 'รายงานการเบิกจ่ายค่าจัดประชุม',
      code: 'report-meet-header-number',
      value: '๖๕',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      report_name: 'รายงานการเบิกจ่ายค่าจัดประชุม',
      code: 'report-meet-header-year',
      value: '๒๕๖๘',
      created_at: new Date(),
      updated_at: new Date()
    }
  ];

  return knex('report_settings').insert(reportSettings);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex('report_settings').del();
};
