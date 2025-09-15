/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  const menuItem = [
    {
      key_name: 'report-settings',
      title: 'ตั้งค่ารายงาน',
      parent_key: 'master-data',
      is_active: true,
      is_admin: true,
    }
  ];

  return knex('menu_items_access').insert(menuItem);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex('menu_items_access').where('key_name', 'report-settings').del();
};
