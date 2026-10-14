/**
 * แก้คำผิดในประเภทการจัดประชุม (dropdown ฟอร์มเบิกจ่ายค่าจัดประชุม) — #454
 * "การจัดกระชุม..." → "การจัดประชุม..."
 *
 * ข้อความนี้ถูก seed ลง meet_rate ไว้จาก knex/seeds/23_meet_rate.js (seed แก้แล้วสำหรับติดตั้งใหม่)
 * แต่ seed ข้ามการ insert เมื่อมีข้อมูลอยู่แล้ว จึงต้องแก้ข้อมูลเดิมด้วย migration นี้
 * meeting_expense_reports.meeting_type อ้างอิง meet_rate.id ไม่ใช่ข้อความ — แก้ข้อความแล้วรายงานเก่าไม่กระทบ
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

const FIX_454 = {
  from: 'การจัดกระชุมที่มี นายก รองนายก หรือประธานกรรมการ ททท.เป็นประธาน',
  to: 'การจัดประชุมที่มี นายก รองนายก หรือประธานกรรมการ ททท.เป็นประธาน',
};

/**
 * คอลัมน์ type เป็น CLOB บน Oracle จึงเทียบด้วย `=` ตรงๆ ไม่ได้
 * ต้องดึงมาเป็น VARCHAR2 ก่อนด้วย DBMS_LOB.SUBSTR แล้วค่อยเทียบ
 */
async function rename(knex, { from, to }) {
  await knex('meet_rate')
    .whereRaw('DBMS_LOB.SUBSTR("type", 4000, 1) = ?', [from])
    .update({ type: to });
}

exports.up = async function (knex) {
  await rename(knex, FIX_454);
};

exports.down = async function (knex) {
  await rename(knex, { from: FIX_454.to, to: FIX_454.from });
};
