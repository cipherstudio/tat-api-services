import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { UserRole } from '../src/modules/users/entities/user.entity';
import knex from 'knex';
import { join } from 'path';
import * as fs from 'fs';

// Load environment variables
dotenv.config();

async function seedSuperAdmin() {
  // Initialize Knex
  const environment = process.env.NODE_ENV || 'development';

  // Find knexfile.js from the current working directory
  const knexfilePath = join(process.cwd(), 'knexfile.js');

  if (!fs.existsSync(knexfilePath)) {
    console.error(`Knexfile not found at ${knexfilePath}`);
    process.exit(1);
  }

  // Import knexfile as ES module
  const knexModule = await import(knexfilePath);
  const knexConfig = knexModule.default;
  const knexInstance = knex(knexConfig[environment]);

  // Start transaction
  const trx = await knexInstance.transaction();

  try {
    console.log('Knex has been initialized!');
    console.log('Starting seed transaction...');

    // Create super admin user
    const hashedPassword = await bcrypt.hash('Admin@123', 10);

    const superAdmin = {
      email: 'admin@example.com',
      password: hashedPassword,
      full_name: 'Super Admin',
      role: UserRole.ADMIN,
      is_active: true,
      login_attempts: 0,
      created_at: new Date(),
      updated_at: new Date(),
    };

    // Save super admin within transaction
    await trx('users').insert(superAdmin);

    // Commit transaction
    await trx.commit();
    console.log('Seed transaction committed successfully');

    console.log('Super admin created successfully!');
    console.log('Email: admin@example.com');
    console.log('Password: Admin@123');
  } catch (error) {
    console.error('Error seeding super admin:', error);
    console.log('Rolling back seed transaction...');

    // Rollback transaction
    await trx.rollback();
    console.log('Seed transaction rolled back');

    throw error;
  } finally {
    // Close the connection
    await knexInstance.destroy();
    console.log('Knex connection has been closed!');
  }
}

// Run the seed function
seedSuperAdmin()
  .then(() => console.log('Seeding completed successfully'))
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });
