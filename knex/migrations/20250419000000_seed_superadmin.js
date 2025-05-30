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
    .where({ email: 'admin@example.com' })
    .first();

  if (!existingAdmin) {
    // Insert superadmin user
    await knex('users').insert({
      email: 'admin@example.com',
      password: hashedPassword,
      full_name: 'Super Admin',
      role: 'admin',
      employee_code: '38019',
      is_active: 1,
      created_at: new Date(),
      updated_at: new Date(),
    });

    console.log('Superadmin user created successfully!');
    console.log('Email: admin@example.com');
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
  return knex('users').where({ email: 'admin@example.com' }).del();
};
