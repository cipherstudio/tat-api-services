/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('approval_clothing_expense', function(table) {
    table.increments('id').primary();

    table.boolean('clothing_file_checked').defaultTo(false);
    table.float('clothing_amount').nullable();
    table.text('clothing_reason').nullable();

    table.string('reporting_date').nullable(); // วันรายงานตัว
    table.string('next_claim_date').nullable(); // วันที่เบิกได้ครั้งถัดไป
    table.string('work_end_date').nullable(); // วันที่กลับ (เอามาจาก step 1)

    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.integer('staff_member_id').nullable();
    table.integer('approval_id').nullable();
    table.integer('employee_code').nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('approval_clothing_and_entertainment_expense');
};
