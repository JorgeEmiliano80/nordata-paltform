
import { DatabaseService } from '@/services/DatabaseService';
import type { User, CreateUserData } from '@/types';

export class UserModel {
  private db: DatabaseService;

  constructor() {
    this.db = new DatabaseService();
  }

  async findById(id: string): Promise<User | null> {
    const result = await this.db.query(
      'SELECT id, email, full_name, company_name, industry, role, is_active, accepted_terms, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.db.query(
      'SELECT id, email, full_name, company_name, industry, role, is_active, accepted_terms, created_at, updated_at FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  }

  async findAll(limit = 100, offset = 0): Promise<User[]> {
    const result = await this.db.query(
      'SELECT id, email, full_name, company_name, industry, role, is_active, accepted_terms, created_at, updated_at FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    return result.rows;
  }

  async create(userData: CreateUserData & { password_hash: string }): Promise<User> {
    const { email, password_hash, full_name, company_name, industry, role } = userData;
    
    const result = await this.db.query(
      `INSERT INTO users (email, password_hash, full_name, company_name, industry, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, full_name, company_name, industry, role, is_active, accepted_terms, created_at, updated_at`,
      [email, password_hash, full_name, company_name, industry, role || 'client']
    );
    
    return result.rows[0];
  }

  async update(id: string, updates: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>): Promise<User> {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    
    const result = await this.db.query(
      `UPDATE users SET ${setClause}, updated_at = NOW() 
       WHERE id = $1 
       RETURNING id, email, full_name, company_name, industry, role, is_active, accepted_terms, created_at, updated_at`,
      [id, ...values]
    );
    
    return result.rows[0];
  }

  async delete(id: string): Promise<void> {
    await this.db.query('DELETE FROM users WHERE id = $1', [id]);
  }

  async count(): Promise<number> {
    const result = await this.db.query('SELECT COUNT(*) as count FROM users');
    return parseInt(result.rows[0].count);
  }
}
