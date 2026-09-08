/**
 * แก้คำผิดในชื่อฟอร์มของเมนู "เอกสารประกอบการเบิกจ่าย" — #438, #439, #440
 *
 * ชื่อพวกนี้ถูก seed ลง disbursement_supporting_forms ไว้ตั้งแต่
 * 20250604093804_seed_disbursement_type_form_v1.js และแสดงหลายจุด
 * (รายการเมนู, หัวข้อหน้า checklist, PDF) แก้ที่ข้อมูลครั้งเดียวจึงครบทุกจุด
 *
 * ห้ามแก้ไฟล์ seed เดิม (เป็นของงานอื่น + รันไปแล้ว) จึงอัปเดตด้วย migration นี้แทน
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

/** #438 ค่าตอบแทบ → ค่าตอบแทน, ทททท. → ททท. */
const FIX_438 = {
  from: 'ค่าตอบแทบรายเดือนคณะกรรมการ ทททท.',
  to: 'ค่าตอบแทนรายเดือนคณะกรรมการ ททท.',
};

/** #439 ทกท. → ททท. */
const FIX_439 = {
  from: 'ค่าตอบแทนรายเดือนคณะกรรมการตรวจสอบ ทกท.',
  to: 'ค่าตอบแทนรายเดือนคณะกรรมการตรวจสอบ ททท.',
};

/** #440 กกม. → กทม. */
const FIX_440 = {
  from: 'ค่าจ้างวันหยุดนอกที่ตั้ง ต่างจังหวัด (ไม่ใช่ในเขต กกม. หรือจังหวัดที่เป็นที่ตั้งสำนักงานสาขา)',
  to: 'ค่าจ้างวันหยุดนอกที่ตั้ง ต่างจังหวัด (ไม่ใช่ในเขต กทม. หรือจังหวัดที่เป็นที่ตั้งสำนักงานสาขา)',
};

const FIXES = [FIX_438, FIX_439, FIX_440];

/**
 * คอลัมน์ name เป็น CLOB บน Oracle จึงเทียบด้วย `=` ตรงๆ ไม่ได้
 * (ORA-00932: inconsistent datatypes: expected - got CLOB)
 * ต้องดึงมาเป็น VARCHAR2 ก่อนด้วย DBMS_LOB.SUBSTR แล้วค่อยเทียบ
 */
async function rename(knex, pairs) {
  for (const { from, to } of pairs) {
    await knex('disbursement_supporting_forms')
      .whereRaw('DBMS_LOB.SUBSTR("name", 4000, 1) = ?', [from])
      .update({ name: to });
  }
}

exports.up = async function (knex) {
  await rename(knex, FIXES);
};

exports.down = async function (knex) {
  await rename(
    knex,
    FIXES.map(({ from, to }) => ({ from: to, to: from })),
  );
};
