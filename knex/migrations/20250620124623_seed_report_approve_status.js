/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  const statuses = [
    { id: 1, status: 'ร่าง' },
    { id: 2, status: 'รออนุมัติ' },
    { id: 3, status: 'อนุมัติ' },
    { id: 4, status: 'ยกเลิก' },
  ];
  return knex('report_approve_status').insert(statuses);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex('report_approve_status').truncate();
};
