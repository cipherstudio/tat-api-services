/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  const groupsTableExists = await knex.schema.hasTable('attire_destination_groups');
  if (!groupsTableExists) {
    await knex.schema.createTable('attire_destination_groups', function(table) {
      table.increments('id').primary();
      table.string('group_code', 20).notNullable().unique();
      table.string('group_name', 100).notNullable();
      table.enum('assignment_type', ['TEMPORARY', 'PERMANENT']).notNullable();
      table.text('description').nullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());

      table.index(['assignment_type']);
      table.index(['group_code', 'assignment_type']);
    });
  }

  const countriesTableExists = await knex.schema.hasTable('attire_destination_group_countries');
  if (!countriesTableExists) {
    await knex.schema.createTable('attire_destination_group_countries', function(table) {
      table.increments('id').primary();
      table.integer('destination_group_id').unsigned().notNullable();
      table.integer('country_id').unsigned().notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());

      table.foreign('destination_group_id')
           .references('id')
           .inTable('attire_destination_groups')
           .onDelete('CASCADE');

      table.foreign('country_id')
           .references('id')
           .inTable('countries')
           .onDelete('CASCADE');

      table.unique(['destination_group_id', 'country_id']);
      table.index(['destination_group_id']);
      table.index(['country_id']);
    });
  }

  const attireRatesExists = await knex.schema.hasTable('attire_allowance_rates');
  if (attireRatesExists) {
    const hasDestinationType = await knex.schema.hasColumn('attire_allowance_rates', 'destination_type');
    const hasDestinationGroupCode = await knex.schema.hasColumn('attire_allowance_rates', 'destination_group_code');
    
    await knex.schema.alterTable('attire_allowance_rates', function(table) {
      if (hasDestinationType) {
        table.dropColumn('destination_type');
      }
      
      if (!hasDestinationGroupCode) {
        table.string('destination_group_code', 20).nullable();
      }
    });

    if (!hasDestinationGroupCode) {
      await knex.schema.alterTable('attire_allowance_rates', function(table) {
        table.index(['assignment_type', 'level_code_start', 'destination_group_code']);
      });
    }
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {

  const attireRatesExists = await knex.schema.hasTable('attire_allowance_rates');
  if (attireRatesExists) {
    const hasDestinationGroupCode = await knex.schema.hasColumn('attire_allowance_rates', 'destination_group_code');
    if (hasDestinationGroupCode) {
      await knex.schema.alterTable('attire_allowance_rates', function(table) {
        table.dropIndex(['assignment_type', 'level_code_start', 'destination_group_code']);
        table.dropColumn('destination_group_code');
      });
    }
  }

  await knex.schema.dropTableIfExists('attire_destination_group_countries');
  await knex.schema.dropTableIfExists('attire_destination_groups');
};
