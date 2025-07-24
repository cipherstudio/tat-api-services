/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return (
    knex.schema
      // 1. Create meeting_types table
      .createTable('meeting_types', function (table) {
        table.bigIncrements('id').primary();
        table.string('name', 255).notNullable().comment('ชื่อประเภทการประชุม');
        table.text('description').comment('คำอธิบาย');
        table.boolean('is_active').defaultTo(true).comment('สถานะการใช้งาน');
        table.integer('sort_order').defaultTo(0).comment('ลำดับการแสดงผล');
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());

        table.unique('name', 'uk_name');
        table.index('is_active', 'idx_types_is_active');
        table.index('sort_order', 'idx_types_sort_order');
      })
      .then(function () {
        // 2. Create meeting_type_rates table
        return knex.schema.createTable('meeting_type_rates', function (table) {
          table.bigIncrements('id').primary();
          table
            .bigInteger('meeting_type_id')
            .unsigned()
            .notNullable()
            .comment('FK to meeting_types.id');
          table
            .enum('meal_type', ['food', 'snack'])
            .notNullable()
            .comment('ประเภทอาหาร (อาหารหลัก/อาหารว่าง)');
          table
            .enum('meal_period', ['morning', 'lunch', 'dinner', 'afternoon'])
            .notNullable()
            .comment('ช่วงมื้ออาหาร');
          table.decimal('rate', 10, 2).notNullable().comment('อัตรา (บาท)');
          table.boolean('is_active').defaultTo(true).comment('สถานะการใช้งาน');
          table.date('effective_date').notNullable().comment('วันที่เริ่มมีผล');
          table.date('expiry_date').nullable().comment('วันที่หมดอายุ');
          table.timestamp('created_at').defaultTo(knex.fn.now());
          table.timestamp('updated_at').defaultTo(knex.fn.now());

          table
            .foreign('meeting_type_id')
            .references('id')
            .inTable('meeting_types')
            .onDelete('CASCADE');
          table.unique(
            ['meeting_type_id', 'meal_type', 'meal_period', 'effective_date'],
            'uk_type_meal_period',
          );
          table.index('meeting_type_id', 'idx_rates_meeting_type_id');
          table.index('meal_type', 'idx_rates_meal_type');
          table.index('meal_period', 'idx_rates_meal_period');
          table.index('is_active', 'idx_rates_is_active');
          table.index('effective_date', 'idx_rates_effective_date');
        });
      })
      .then(function () {
        // 3. Create meeting_expense_reports table
        return knex.schema.createTable(
          'meeting_expense_reports',
          function (table) {
            table.bigIncrements('id').primary();
            table.string('department', 255).notNullable().comment('ฝ่าย');
            table.string('section', 255).notNullable().comment('กอง');
            table.string('job', 255).notNullable().comment('งาน');
            table
              .string('employee_id', 50)
              .notNullable()
              .comment('รหัสพนักงาน');
            table.string('name', 255).notNullable().comment('ชื่อผู้ขอ');
            table.string('position', 255).notNullable().comment('ตำแหน่ง');
            table.string('topic', 500).notNullable().comment('ประชุมเรื่อง');
            table.string('place', 500).notNullable().comment('สถานที่');
            table
              .string('meeting_type', 255)
              .notNullable()
              .comment('ประเภทการจัดประชุม');
            table.string('chairman', 255).comment('ประธานที่ประชุม');
            table
              .string('attendees', 255)
              .notNullable()
              .comment('ผู้เข้าร่วมประชุม (คน)');
            table.date('meeting_date').notNullable().comment('วันที่จัดประชุม');
            table
              .decimal('total_amount', 15, 2)
              .defaultTo(0.0)
              .comment('ยอดรวมทั้งหมด');
            table
              .enum('status', ['draft', 'pending', 'approved', 'rejected'])
              .defaultTo('draft')
              .comment('สถานะ');
            table.string('status_description', 255).comment('คำอธิบายสถานะ');
            table.string('created_by', 50).comment('ผู้สร้าง');
            table
              .timestamp('created_at')
              .defaultTo(knex.fn.now())
              .comment('วันที่สร้าง');
            table
              .timestamp('updated_at')
              .defaultTo(knex.fn.now())
              .comment('วันที่อัพเดต');
            table
              .timestamp('deleted_at')
              .nullable()
              .comment('วันที่ลบ (soft delete)');

            table.index('employee_id', 'idx_reports_employee_id');
            table.index('department', 'idx_reports_department');
            table.index('section', 'idx_reports_section');
            table.index('job', 'idx_reports_job');
            table.index('status', 'idx_reports_status');
            table.index('meeting_date', 'idx_meeting_date');
            table.index('created_at', 'idx_reports_created_at');
            table.index('deleted_at', 'idx_reports_deleted_at');
          },
        );
      })
      .then(function () {
        // 4. Create meeting_expense_report_food_rows table
        return knex.schema.createTable(
          'meeting_expense_report_food_rows',
          function (table) {
            table.bigIncrements('id').primary();
            table
              .bigInteger('meeting_expense_report_id')
              .unsigned()
              .notNullable()
              .comment('FK to meeting_expense_reports.id');
            table
              .enum('meal_type', ['morning', 'lunch', 'dinner'])
              .notNullable()
              .comment('ประเภทมื้ออาหาร');
            table
              .string('meal_name', 50)
              .notNullable()
              .comment('ชื่อมื้อ (เช้า, กลางวัน, เย็น)');
            table
              .boolean('checked')
              .defaultTo(false)
              .comment('เลือกใช้หรือไม่');
            table
              .decimal('rate', 10, 2)
              .defaultTo(0.0)
              .comment('อัตรามื้อละ (บาท)');
            table
              .decimal('amount', 15, 2)
              .defaultTo(0.0)
              .comment('เป็นเงิน (บาท)');
            table
              .string('receipt', 255)
              .comment('เล่มที่/เลขที่ใบเสร็จรับเงิน');
            table
              .date('receipt_date')
              .nullable()
              .comment('วัน เดือน ปี ของใบเสร็จ');
            table.timestamp('created_at').defaultTo(knex.fn.now());
            table.timestamp('updated_at').defaultTo(knex.fn.now());

            table
              .foreign('meeting_expense_report_id')
              .references('id')
              .inTable('meeting_expense_reports')
              .onDelete('CASCADE');
            table.index(
              'meeting_expense_report_id',
              'idx_food_rows_meeting_expense_report_id',
            );
            table.index('meal_type', 'idx_food_rows_meal_type');
            table.index('checked', 'idx_food_rows_checked');
          },
        );
      })
      .then(function () {
        // 5. Create meeting_expense_report_snack_rows table
        return knex.schema.createTable(
          'meeting_expense_report_snack_rows',
          function (table) {
            table.bigIncrements('id').primary();
            table
              .bigInteger('meeting_expense_report_id')
              .unsigned()
              .notNullable()
              .comment('FK to meeting_expense_reports.id');
            table
              .enum('snack_type', ['morning', 'afternoon'])
              .notNullable()
              .comment('ประเภทอาหารว่าง');
            table
              .string('snack_name', 50)
              .notNullable()
              .comment('ชื่ออาหารว่าง (เช้า, บ่าย)');
            table
              .boolean('checked')
              .defaultTo(false)
              .comment('เลือกใช้หรือไม่');
            table
              .decimal('rate', 10, 2)
              .defaultTo(0.0)
              .comment('อัตรามื้อละ (บาท)');
            table
              .decimal('amount', 15, 2)
              .defaultTo(0.0)
              .comment('เป็นเงิน (บาท)');
            table
              .string('receipt', 255)
              .comment('เล่มที่/เลขที่ใบเสร็จรับเงิน');
            table
              .date('receipt_date')
              .nullable()
              .comment('วัน เดือน ปี ของใบเสร็จ');
            table.timestamp('created_at').defaultTo(knex.fn.now());
            table.timestamp('updated_at').defaultTo(knex.fn.now());

            table
              .foreign('meeting_expense_report_id')
              .references('id')
              .inTable('meeting_expense_reports')
              .onDelete('CASCADE');
            table.index(
              'meeting_expense_report_id',
              'idx_snack_rows_meeting_expense_report_id',
            );
            table.index('snack_type', 'idx_snack_rows_snack_type');
            table.index('checked', 'idx_snack_rows_checked');
          },
        );
      })
      .then(function () {
        // 6. Insert initial meeting types data
        return knex('meeting_types').insert([
          {
            name: 'ประชุมประจำเดือน',
            description: 'การประชุมประจำเดือนของหน่วยงาน',
            sort_order: 1,
          },
          {
            name: 'ประชุมคณะกรรมการ',
            description: 'การประชุมคณะกรรมการต่างๆ',
            sort_order: 2,
          },
          {
            name: 'ประชุมวางแผนงาน',
            description: 'การประชุมเพื่อวางแผนงาน',
            sort_order: 3,
          },
          {
            name: 'ประชุมติดตามผล',
            description: 'การประชุมติดตามผลการดำเนินงาน',
            sort_order: 4,
          },
          {
            name: 'ประชุมสัมมนา',
            description: 'การประชุมสัมมนา',
            sort_order: 5,
          },
          { name: 'ประชุมอบรม', description: 'การประชุมอบรม', sort_order: 6 },
        ]);
      })
      .then(function () {
        // 7. Insert sample rates data
        const currentDate = new Date();
        return knex('meeting_type_rates').insert([
          // ประชุมประจำเดือน
          {
            meeting_type_id: 1,
            meal_type: 'food',
            meal_period: 'morning',
            rate: 150.0,
            effective_date: currentDate,
          },
          {
            meeting_type_id: 1,
            meal_type: 'food',
            meal_period: 'lunch',
            rate: 200.0,
            effective_date: currentDate,
          },
          {
            meeting_type_id: 1,
            meal_type: 'food',
            meal_period: 'dinner',
            rate: 200.0,
            effective_date: currentDate,
          },
          {
            meeting_type_id: 1,
            meal_type: 'snack',
            meal_period: 'morning',
            rate: 80.0,
            effective_date: currentDate,
          },
          {
            meeting_type_id: 1,
            meal_type: 'snack',
            meal_period: 'afternoon',
            rate: 80.0,
            effective_date: currentDate,
          },

          // ประชุมคณะกรรมการ
          {
            meeting_type_id: 2,
            meal_type: 'food',
            meal_period: 'morning',
            rate: 180.0,
            effective_date: currentDate,
          },
          {
            meeting_type_id: 2,
            meal_type: 'food',
            meal_period: 'lunch',
            rate: 250.0,
            effective_date: currentDate,
          },
          {
            meeting_type_id: 2,
            meal_type: 'food',
            meal_period: 'dinner',
            rate: 250.0,
            effective_date: currentDate,
          },
          {
            meeting_type_id: 2,
            meal_type: 'snack',
            meal_period: 'morning',
            rate: 100.0,
            effective_date: currentDate,
          },
          {
            meeting_type_id: 2,
            meal_type: 'snack',
            meal_period: 'afternoon',
            rate: 100.0,
            effective_date: currentDate,
          },
        ]);
      })
  );
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists('meeting_expense_report_snack_rows')
    .then(function () {
      return knex.schema.dropTableIfExists('meeting_expense_report_food_rows');
    })
    .then(function () {
      return knex.schema.dropTableIfExists('meeting_expense_reports');
    })
    .then(function () {
      return knex.schema.dropTableIfExists('meeting_type_rates');
    })
    .then(function () {
      return knex.schema.dropTableIfExists('meeting_types');
    });
};
