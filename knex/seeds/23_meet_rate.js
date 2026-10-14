/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

exports.seed = async function (knex) {
  // Check if data already exists
  const existingData = await knex('meet_rate');

  // insert data if no data exists
  if (existingData.length === 0) {
    // Inserts seed entries
    await knex('meet_rate').insert([
      {
        type: 'การจัดประชุมคณะทำงานที่คณะกรรมการ ททท.แต่งตั้ง',
        food: 35000.0,
        snack: 15000.0,
      },
      {
        type: 'การจัดประชุมของคณะทำงานที่ผู้ว่าแต่งตั้ง',
        food: 3000.0,
        snack: 500.0,
      },
      {
        type: 'การจัดประชุมที่มี นายก รองนายก หรือประธานกรรมการ ททท.เป็นประธาน',
        food: 3500.0,
        snack: 700.0,
      },
      {
        type: 'การจัดประชุมที่มีผู้ว่าการหรือพนักงานระดับ 10 ลงมาถึงหัวหน้าเป็นประธาน',
        food: 3000.0,
        snack: 500.0,
      },
      {
        type: 'การจัดประชุมเพื่อบริหารงานหรือกิจการของ ททท.',
        food: 2000.0,
        snack: 300.0,
      },
    ]);
  }
};
