/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
// The old CHECK on country_type ('A','B') came from knex's enum, so Oracle named it
// itself (SYS_C0014231 on UAT, something else on any other database). Look it up
// instead of hardcoding that name.
async function findCountryTypeCheck(knex) {
  const rows = await knex.raw(
    `SELECT constraint_name FROM user_constraints
      WHERE table_name = 'training_accommodation_rates' AND constraint_type = 'C'
        AND search_condition_vc LIKE '"country_type" in%'`,
  );
  return rows.map((row) => row.CONSTRAINT_NAME);
}

exports.up = async function (knex) {
  for (const name of await findCountryTypeCheck(knex)) {
    await knex.raw(`ALTER TABLE "training_accommodation_rates" DROP CONSTRAINT "${name}"`);
  }
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
    'ALTER TABLE "training_accommodation_rates" ADD CHECK ("country_type" in (\'A\', \'B\'))'
  );
};
