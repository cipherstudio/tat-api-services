/**
 * ค่าที่พักฝึกอบรม (#356) — อัตราตามบัญชีหมายเลข 3 ของกรมบัญชีกลาง
 * ในประเทศ: ไม่แยกกลุ่มประเทศ. ต่างประเทศ: แยกตามกลุ่มประเทศ ก/ข/ค (country_type)
 * ลบเฉพาะแถว "ทั่วไป" (ไม่มี level/position เจาะจง) เดิมก่อน แล้ว insert ใหม่ให้ rerun ได้โดยไม่ซ้ำ
 * ไม่แตะแถวที่ admin เพิ่มเองผ่าน UI (มี level_code_start/level_code_end/position_name)
 */

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  await knex('training_accommodation_rates')
    .whereNull('position_name')
    .whereNull('level_code_start')
    .whereNull('level_code_end')
    .del();

  await knex('training_accommodation_rates').insert([
    // ในประเทศ — ไม่แยกกลุ่มประเทศ
    { travel_type: 'DOMESTIC', training_type: 'type-a', single_room_amount: 2700, double_room_amount: 1500 },
    { travel_type: 'DOMESTIC', training_type: 'type-b', single_room_amount: 1600, double_room_amount: 1000 },
    { travel_type: 'DOMESTIC', training_type: 'outsider', single_room_amount: 1600, double_room_amount: 1000 },

    // ต่างประเทศ — แยกตามกลุ่มประเทศ ก/ข/ค
    { travel_type: 'INTERNATIONAL', training_type: 'type-a', country_type: 'A', single_room_amount: 8000, double_room_amount: 5600 },
    { travel_type: 'INTERNATIONAL', training_type: 'type-a', country_type: 'B', single_room_amount: 5600, double_room_amount: 3900 },
    { travel_type: 'INTERNATIONAL', training_type: 'type-a', country_type: 'C', single_room_amount: 3600, double_room_amount: 2500 },

    { travel_type: 'INTERNATIONAL', training_type: 'type-b', country_type: 'A', single_room_amount: 6000, double_room_amount: 4200 },
    { travel_type: 'INTERNATIONAL', training_type: 'type-b', country_type: 'B', single_room_amount: 4000, double_room_amount: 2800 },
    { travel_type: 'INTERNATIONAL', training_type: 'type-b', country_type: 'C', single_room_amount: 2400, double_room_amount: 1700 },

    { travel_type: 'INTERNATIONAL', training_type: 'outsider', country_type: 'A', single_room_amount: 6000, double_room_amount: 4200 },
    { travel_type: 'INTERNATIONAL', training_type: 'outsider', country_type: 'B', single_room_amount: 4000, double_room_amount: 2800 },
    { travel_type: 'INTERNATIONAL', training_type: 'outsider', country_type: 'C', single_room_amount: 2400, double_room_amount: 1700 },
  ]);
};
