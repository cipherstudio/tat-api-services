/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('approval', function(table) {
    table.increments('id').primary();
    table.string('increment_id').nullable();

    // form 1
    table.string('record_type').nullable();
    table.string('name').nullable();
    table.string('employee_code').nullable();
    table.string('travel_type').nullable();

    table.string('international_sub_option').nullable();
    table.integer('approval_ref').nullable();//.unsigned().nullable().references('id').inTable('approval');

    table.string('work_start_date').nullable();
    table.string('work_end_date').nullable();
    table.string('start_country').nullable();
    table.string('end_country').nullable();
    table.string('remarks').nullable();

    table.string('num_travelers').nullable();

    table.string('document_no').nullable();
    table.string('document_tel').nullable();
    table.string('document_to').nullable();
    table.text('document_title').nullable();

    table.integer('attachment_id').nullable();

    //table.integer('latest_approval_status_id').unsigned().notNullable().references('id').inTable('approval_status');

    // form 3
    table.float('form3_total_outbound').nullable();
    table.float('form3_total_inbound').nullable();
    table.float('form3_total_amount').nullable();


    // form 4
    table.boolean('exceed_lodging_rights_checked').defaultTo(false);
    table.text('exceed_lodging_rights_reason').nullable();
    table.float('form4_total_amount').nullable();

    // form 5
    table.float('form5_total_amount').nullable();

    // form 8
    // table.json('confidentiality_level').nullable();
    // table.json('urgency_level').nullable();
    // table.json('final_departments').nullable();
    // table.json('final_degrees').nullable();
    // table.json('final_staff').nullable(); // Record<string, string>
    // table.date('signer_date').nullable();
    // table.string('signature_type').nullable();
    // table.boolean('use_file_signature').defaultTo(false);
    // table.boolean('use_system_signature').defaultTo(false);
    // table.string('signature_file_path').nullable(); // แทน File ด้วย path
    // table.string('document_ending').nullable();
    // table.text('document_ending_wording').nullable();
    // table.string('signatory').nullable();

    table.integer('user_id').unsigned().notNullable().references('id').inTable('users');

    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.timestamp('deleted_at').nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('approval');
};
