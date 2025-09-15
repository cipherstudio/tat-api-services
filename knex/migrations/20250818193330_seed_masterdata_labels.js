/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  const tables = [
    {
        table_name: 'meet_rate',
        table_description: 'ค่าใช้จ่ายการจัดประชุมในประเทศ',
        document_name: 'ค่าใช้จ่ายการจัดประชุมในประเทศ',
        document_reference: 'MASTER-023',
        updated_by: 'system',
      },
  ];

  return knex('masterdata_labels').insert(tables);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex('masterdata_labels').del();
};
