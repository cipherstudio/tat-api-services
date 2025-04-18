import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../../modules/users/entities/user.entity';

export class SeedSuperAdmin1709392533046 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Hash the password - using the standard 10 rounds as seen in the auth service
    const hashedPassword = await bcrypt.hash('Admin@123', 10);

    // Insert superadmin user
    await queryRunner.query(`
      INSERT INTO users (
        email, 
        password, 
        full_name, 
        role, 
        is_active, 
        created_at, 
        updated_at
      ) VALUES (
        'admin@example.com', 
        '${hashedPassword}', 
        'Super Admin', 
        '${UserRole.ADMIN}', 
        1, 
        CURRENT_TIMESTAMP, 
        CURRENT_TIMESTAMP
      )
    `);

    console.log('Superadmin user seeded successfully');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove the superadmin user
    await queryRunner.query(`
      DELETE FROM users 
      WHERE email = 'admin@example.com'
    `);
  }
}
