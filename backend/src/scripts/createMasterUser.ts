
import { AuthService } from '@/services/AuthService';
import { config } from '@/config/env';
import { logger } from '@/utils/logger';
import { DatabaseService } from '@/services/DatabaseService';

async function createMasterUser() {
  const db = new DatabaseService();
  const authService = new AuthService();

  try {
    await db.connect();
    logger.info('Connected to database');

    // Check if master user already exists
    const existingUser = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [config.MASTER_EMAIL]
    );

    if (existingUser.rows.length > 0) {
      logger.info('Master user already exists');
      return;
    }

    // Create master user
    const hashedPassword = await authService.hashPassword(config.MASTER_PASSWORD);
    
    const result = await db.query(
      `INSERT INTO users (email, password_hash, full_name, role, is_active, accepted_terms)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, full_name, role`,
      [
        config.MASTER_EMAIL,
        hashedPassword,
        'Master Administrator',
        'admin',
        true,
        true
      ]
    );

    const masterUser = result.rows[0];
    logger.info('Master user created successfully:', {
      id: masterUser.id,
      email: masterUser.email,
      role: masterUser.role
    });

  } catch (error) {
    logger.error('Error creating master user:', error);
    throw error;
  } finally {
    await db.disconnect();
  }
}

if (require.main === module) {
  createMasterUser()
    .then(() => {
      logger.info('Master user setup completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Master user setup failed:', error);
      process.exit(1);
    });
}

export { createMasterUser };
