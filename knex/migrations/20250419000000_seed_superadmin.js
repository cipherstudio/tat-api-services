const bcrypt = require('bcrypt');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  // Hash password
  const hashedPassword = await bcrypt.hash('Admin@123', 10);

  // Check if the admin user already exists
  const existingAdmin = await knex('users')
    .where({ email: 'admin@email.com' })
    .first();

  if (!existingAdmin) {
    // Insert superadmin user
    await knex('users').insert({
      email: 'admin@email.com',
      password: hashedPassword,
      full_name: 'Super Admin',
      role: 'admin',
      employee_code: '65028',
      is_active: 1,
      created_at: new Date(),
      updated_at: new Date(),
    });

    console.log('Superadmin user created successfully!');
    console.log('Email: admin@email.com');
    console.log('Password: Admin@123');
  } else {
    console.log('Superadmin user already exists.');
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex('users').where({ email: 'admin@email.com' }).del();
};
