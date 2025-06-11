/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const provinces = require('../constants/provinces');
const amphurs = require('../constants/amphurs');

exports.seed = async function (knex) {
  await knex('expenses_bangkok_to_place').del();

  // ลบ amphurs ก่อน provinces เพื่อไม่ให้เกิด foreign key constraint error
  await knex('amphurs').del();
  await knex('provinces').del();

  await knex('provinces').insert(provinces);
  await knex('amphurs').insert(amphurs);
};
