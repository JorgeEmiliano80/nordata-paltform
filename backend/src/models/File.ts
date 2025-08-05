
import { DatabaseService } from '@/services/DatabaseService';
import type { FileRecord } from '@/types';

export class FileModel {
  private db: DatabaseService;

  constructor() {
    this.db = new DatabaseService();
  }

  async create(fileData: Omit<FileRecord, 'id' | 'uploaded_at' | 'processed_at'>): Promise<FileRecord> {
    const { user_id, file_name, file_type, file_size, storage_path, status, metadata } = fileData;
    
    const result = await this.db.query(
      `INSERT INTO files (user_id, file_name, file_type, file_size, storage_path, status, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [user_id, file_name, file_type, file_size, storage_path, status || 'uploaded', JSON.stringify(metadata || {})]
    );
    
    return result.rows[0];
  }

  async findById(id: string): Promise<FileRecord | null> {
    const result = await this.db.query('SELECT * FROM files WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async findByUserId(userId: string, limit = 100, offset = 0): Promise<FileRecord[]> {
    const result = await this.db.query(
      'SELECT * FROM files WHERE user_id = $1 ORDER BY uploaded_at DESC LIMIT $2 OFFSET $3',
      [userId, limit, offset]
    );
    return result.rows;
  }

  async updateStatus(id: string, status: FileRecord['status'], errorMessage?: string): Promise<FileRecord> {
    const result = await this.db.query(
      `UPDATE files 
       SET status = $2, error_message = $3, processed_at = CASE WHEN $2 = 'done' THEN NOW() ELSE processed_at END
       WHERE id = $1 
       RETURNING *`,
      [id, status, errorMessage]
    );
    return result.rows[0];
  }

  async updateJobId(id: string, jobId: string): Promise<FileRecord> {
    const result = await this.db.query(
      'UPDATE files SET databricks_job_id = $2 WHERE id = $1 RETURNING *',
      [id, jobId]
    );
    return result.rows[0];
  }

  async delete(id: string): Promise<void> {
    await this.db.query('DELETE FROM files WHERE id = $1', [id]);
  }

  async getStats(userId?: string): Promise<{ total: number; processing: number; done: number; error: number }> {
    const whereClause = userId ? 'WHERE user_id = $1' : '';
    const params = userId ? [userId] : [];
    
    const result = await this.db.query(
      `SELECT 
         COUNT(*) as total,
         COUNT(*) FILTER (WHERE status = 'processing') as processing,
         COUNT(*) FILTER (WHERE status = 'done') as done,
         COUNT(*) FILTER (WHERE status = 'error') as error
       FROM files ${whereClause}`,
      params
    );
    
    return {
      total: parseInt(result.rows[0].total),
      processing: parseInt(result.rows[0].processing),
      done: parseInt(result.rows[0].done),
      error: parseInt(result.rows[0].error)
    };
  }
}
