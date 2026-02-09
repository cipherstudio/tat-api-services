/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .hasColumn('approval_accommodation_expense', 'lodging_fixed_rights')
    .then((exists) => {
      if (exists) {
        return knex.schema.alterTable('approval_accommodation_expense', function (table) {
          table.dropColumn('lodging_fixed_rights');
        });
      }
    })
    .then(() => {
      return knex.schema.hasColumn('approval_accommodation_expense', 'lodging_double_rights');
    })
    .then((exists) => {
      if (exists) {
        return knex.schema.alterTable('approval_accommodation_expense', function (table) {
          table.dropColumn('lodging_double_rights');
        });
      }
    })
    .then(() => {
      return knex.schema.hasColumn('approval_accommodation_expense', 'lodging_single_rights');
    })
    .then((exists) => {
      if (exists) {
        return knex.schema.alterTable('approval_accommodation_expense', function (table) {
          table.dropColumn('lodging_single_rights');
        });
      }
    })
    .then(() => {
      return knex.schema.hasColumn('approval_accommodation_expense', 'allowance_out_rights');
    })
    .then((exists) => {
      if (exists) {
        return knex.schema.alterTable('approval_accommodation_expense', function (table) {
          table.dropColumn('allowance_out_rights');
        });
      }
    })
    .then(() => {
      return knex.schema.hasColumn('approval_accommodation_expense', 'allowance_in_rights');
    })
    .then((exists) => {
      if (exists) {
        return knex.schema.alterTable('approval_accommodation_expense', function (table) {
          table.dropColumn('allowance_in_rights');
        });
      }
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable('approval_accommodation_expense', function (table) {
    // Re-add columns if rolling back
    table.decimal('lodging_fixed_rights', 10, 2).nullable().comment('ค่าสิทธิ์ที่ user แก้ไขสำหรับค่าที่พักแบบ Fixed');
    table.decimal('lodging_double_rights', 10, 2).nullable().comment('ค่าสิทธิ์ที่ user แก้ไขสำหรับค่าที่พักแบบ Double');
    table.decimal('lodging_single_rights', 10, 2).nullable().comment('ค่าสิทธิ์ที่ user แก้ไขสำหรับค่าที่พักแบบ Single');
    table.decimal('allowance_out_rights', 10, 2).nullable().comment('ค่าสิทธิ์ที่ user แก้ไขสำหรับเบี้ยเลี้ยงนอกพื้นที่ตั้งสำนักงาน (ต่างจังหวัด)');
    table.decimal('allowance_in_rights', 10, 2).nullable().comment('ค่าสิทธิ์ที่ user แก้ไขสำหรับเบี้ยเลี้ยงในเขตพื้นที่ตั้งสำนักงาน');
  });
};

