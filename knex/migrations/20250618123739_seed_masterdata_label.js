/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  const tables = [
    {
      table_name: 'amphurs',
      table_description: 'เขต/อำเภอ',
      document_name: 'เขต/อำเภอ',
      document_reference: 'MASTER-001',
      updated_by: 'system',
    },
    {
      table_name: 'provinces',
      table_description: 'จังหวัด',
      document_name: 'จังหวัด',
      document_reference: 'MASTER-002',
      updated_by: 'system',
    },
    {
      table_name: 'expenses_other_conditions',
      table_description: 'ค่าเลี้ยงรับรอง',
      document_name: 'ค่าเลี้ยงรับรอง',
      document_reference: 'MASTER-003',
      updated_by: 'system',
    },
    {
      table_name: 'expenses_other',
      table_description: 'ค่าใช้จ่ายอื่นๆ',
      document_name: 'ค่าใช้จ่ายอื่นๆ',
      document_reference: 'MASTER-004',
      updated_by: 'system',
    },
    {
      table_name: 'committee_position',
      table_description: 'ตำแหน่ง คณะกรรมการ',
      document_name: 'ตำแหน่ง คณะกรรมการ',
      document_reference: 'MASTER-005',
      updated_by: 'system',
    },
    {
      table_name: 'outsider_equivalent',
      table_description: 'เทียบสิทธิ์ บุคคลภายนอก / สื่อมวลชน',
      document_name: 'เทียบสิทธิ์ บุคคลภายนอก / สื่อมวลชน',
      document_reference: 'MASTER-006',
      updated_by: 'system',
    },
    {
      table_name: 'places',
      table_description: 'สถานที่',
      document_name: 'สถานที่',
      document_reference: 'MASTER-007',
      updated_by: 'system',
    },
    {
      table_name: 'office_international',
      table_description: 'สำนักงานต่างประเทศ',
      document_name: 'สำนักงานต่างประเทศ',
      document_reference: 'MASTER-008',
      updated_by: 'system',
    },
    {
      table_name: 'domestic_moving_allowances',
      table_description: 'ค่าขนย้ายประจำในประเทศ',
      document_name: 'ค่าขนย้ายประจำในประเทศ',
      document_reference: 'MASTER-009',
      updated_by: 'system',
    },
    {
      table_name: 'office_domestic',
      table_description: 'สำนักงานในประเทศ',
      document_name: 'สำนักงานในประเทศ',
      document_reference: 'MASTER-010',
      updated_by: 'system',
    },
    {
      table_name: 'international_moving_allowances',
      table_description: 'ค่าขนย้ายประจำในต่างประเทศ (ค่า พขต.)',
      document_name: 'ค่าขนย้ายประจำในต่างประเทศ (ค่า พขต.)',
      document_reference: 'MASTER-011',
      updated_by: 'system',
    },
    {
      table_name: 'countries',
      table_description: 'ประเทศ',
      document_name: 'ประเทศ',
      document_reference: 'MASTER-012',
      updated_by: 'system',
    },
    {
      table_name: 'per_diem_rates',
      table_description: 'ค่าเบี้ยเลี้ยงเดินทาง',
      document_name: 'ค่าเบี้ยเลี้ยงเดินทาง',
      document_reference: 'MASTER-013',
      updated_by: 'system',
    },
    {
      table_name: 'attire_allowance_rates',
      table_description: 'ค่าเครื่องแต่งกาย',
      document_name: 'ค่าเครื่องแต่งกาย',
      document_reference: 'MASTER-014',
      updated_by: 'system',
    },
    {
      table_name: 'accommodation_rates',
      table_description: 'ค่าที่พัก',
      document_name: 'ค่าที่พัก',
      document_reference: 'MASTER-015',
      updated_by: 'system',
    },
    {
      table_name: 'expenses_bangkok_to_place',
      table_description: 'ค่าพาหนะ (เขต - สถานที่)',
      document_name: 'ค่าพาหนะ (เขต - สถานที่)',
      document_reference: 'MASTER-016',
      updated_by: 'system',
    },
    {
      table_name: 'currencies',
      table_description: 'ค่าสกุลเงิน',
      document_name: 'ค่าสกุลเงิน',
      document_reference: 'MASTER-017',
      updated_by: 'system',
    },
    {
      table_name: 'holiday_work_rates',
      table_description: 'ค่าทำงานวันหยุด',
      document_name: 'ค่าทำงานวันหยุด',
      document_reference: 'MASTER-018',
      updated_by: 'system',
    },
    {
      table_name: 'approval_clothing_expense',
      table_description: 'ค่าเครื่องแต่งกาย',
      document_name: 'ค่าเครื่องแต่งกาย',
      document_reference: 'MASTER-019',
      updated_by: 'system',
    },
    {
      table_name: 'entertainment_allowances',
      table_description: 'ค่ารับรองตามสิทธิ์',
      document_name: 'ค่ารับรองตามสิทธิ์',
      document_reference: 'MASTER-020',
      updated_by: 'system',
    },
    {
      table_name: 'expenses_vehicle',
      table_description: 'ค่าพาหนะรับจ้าง',
      document_name: 'ค่าพาหนะรับจ้าง',
      document_reference: 'MASTER-021',
      updated_by: 'system',
    },
    {
      table_name: 'privilege',
      table_description: 'รายการสิทธิ์',
      document_name: 'รายการสิทธิ์',
      document_reference: 'MASTER-022',
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
