/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('report_allowance', function (table) {
    table.increments('allowance_id').primary(); // PK
    table.integer('form_id'); // FK (สามารถเพิ่ม .unsigned() และ .references() ถ้าต้องการ)
    table.string('type');
    table.string('category');
    table.string('sub_category');
    table.integer('days');
    table.float('total');

    // Foreign key constraint (ถ้ามีตาราง form)
    table
      .foreign('form_id')
      .references('form_id')
      .inTable('report_traveller_form');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('report_allowance');
};
