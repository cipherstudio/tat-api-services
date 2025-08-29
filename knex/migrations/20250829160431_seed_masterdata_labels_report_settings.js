/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  const masterdataLabel = [
    {
      table_name: 'report_settings',
      table_description: 'ตั้งค่ารายงาน',
      document_name: 'ตั้งค่ารายงาน',
      document_reference: 'MASTER-024',
      updated_by: 'system',
    }
  ];

  return knex('masterdata_labels').insert(masterdataLabel);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex('masterdata_labels').where('table_name', 'report_settings').del();
};
