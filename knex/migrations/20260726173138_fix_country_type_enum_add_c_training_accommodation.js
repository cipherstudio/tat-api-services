/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.raw('ALTER TABLE "training_accommodation_rates" DROP CONSTRAINT "SYS_C0014231"');
  await knex.raw(
    'ALTER TABLE "training_accommodation_rates" ADD CONSTRAINT "training_accommodation_rates_country_type_check" CHECK ("country_type" in (\'A\', \'B\', \'C\'))'
  );
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.raw('ALTER TABLE "training_accommodation_rates" DROP CONSTRAINT "training_accommodation_rates_country_type_check"');
  await knex.raw(
    'ALTER TABLE "training_accommodation_rates" ADD CONSTRAINT "SYS_C0014231" CHECK ("country_type" in (\'A\', \'B\'))'
  );
};
