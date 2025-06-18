/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const attire_destination_groups = require('../constants/attire_destination_groups');
const attire_destination_group_countries = require('../constants/attire_destination_group_countries');

exports.seed = async function(knex) {
  // ลบข้อมูลเดิม (ตารางที่มี FK ก่อน)
  await knex('attire_destination_group_countries').del();
  await knex('attire_destination_groups').del();

  // 1. เติมข้อมูลกลุ่มประเทศ (เฉพาะ exception cases)
  console.log('Seeding attire destination groups (exception cases only)...');
  const insertedGroups = await knex('attire_destination_groups').insert(attire_destination_groups).returning(['id', 'group_code']);
  
  // สร้าง mapping group_code -> id
  const groupMapping = {};
  insertedGroups.forEach(group => {
    groupMapping[group.group_code] = group.id;
  });

  // 2. เติมข้อมูลประเทศในกลุ่ม TEMP_EXEMPTED และ PERM_B เท่านั้น
  console.log('Seeding exception country mappings (TEMP_EXEMPTED and PERM_B)...');
  const countryMappings = [];
  
  attire_destination_group_countries.forEach(item => {
    const groupId = groupMapping[item.group_code];
    if (groupId) {
      countryMappings.push({
        destination_group_id: groupId,
        country_id: item.country_id
      });
    }
  });

  if (countryMappings.length > 0) {
    await knex('attire_destination_group_countries').insert(countryMappings);
  }

  console.log('Attire destination groups seeding completed!');
  console.log(`- Total exception groups: ${insertedGroups.length}`);
  console.log(`- Total exception country mappings: ${countryMappings.length}`);
  console.log('- Countries not in exception lists will use default rules:');
  console.log('  * Not in TEMP_EXEMPTED = TEMP_ELIGIBLE (มีสิทธิ์เบิกชั่วคราว)');
  console.log('  * Not in PERM_B = PERM_A (ประเทศประเภท ก)');
};
