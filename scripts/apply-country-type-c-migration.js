const knex = require('knex')(require('../knexfile.js').development);

async function run() {
  await knex.raw('ALTER TABLE "training_accommodation_rates" DROP CONSTRAINT "SYS_C0014231"');
  await knex.raw(
    'ALTER TABLE "training_accommodation_rates" ADD CONSTRAINT "training_accommodation_rates_country_type_check" CHECK ("country_type" in (\'A\', \'B\', \'C\'))'
  );

  const [{ max_batch }] = await knex('knex_migrations').max('batch as max_batch');
  const nextBatch = (max_batch || 0) + 1;

  await knex('knex_migrations').insert({
    name: '20260726173138_fix_country_type_enum_add_c_training_accommodation.js',
    batch: nextBatch,
    migration_time: new Date(),
  });

  console.log('Applied country_type C fix, batch', nextBatch);
  await knex.destroy();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
