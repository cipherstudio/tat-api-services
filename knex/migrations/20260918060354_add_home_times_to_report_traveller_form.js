/**
 * #445 — Per-traveller "left home / returned home" times entered on the
 * transport receipt certificate (ใบรับรองแทนใบเสร็จรับเงินค่าพาหนะ) in step 2.
 * Group reports print each traveller's own times; they differ per person and
 * must not share departure_time / return_time, which hold the group's trip
 * times from step 1.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable('report_traveller_form', (table) => {
    table.string('home_departure_time', 10).nullable();
    table.string('home_return_time', 10).nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable('report_traveller_form', (table) => {
    table.dropColumn('home_departure_time');
    table.dropColumn('home_return_time');
  });
};
