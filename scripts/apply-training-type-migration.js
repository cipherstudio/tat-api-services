const knex = require('knex')(require('../knexfile.js').development);

async function run() {
  await knex.schema.alterTable('approval', function (table) {
    table.string('training_type').nullable();
  });

  const [{ max_batch }] = await knex('knex_migrations')
    .max('batch as max_batch');
  const nextBatch = (max_batch || 0) + 1;

  await knex('knex_migrations').insert({
    name: '20260724092348_add_training_type_to_approvals.js',
    batch: nextBatch,
    migration_time: new Date(),
  });

  console.log('Applied training_type column, batch', nextBatch);
  await knex.destroy();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
