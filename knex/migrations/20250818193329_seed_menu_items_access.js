/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex('menu_items_access').insert([
    {
        key_name: 'meet-rate',
        title: 'ค่าใช้จ่ายการจัดประชุมในประเทศ',
        parent_key: 'master-data',
        is_active: true,
        is_admin: true,
    }
  ]);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex('menu_items_access').del();
};
