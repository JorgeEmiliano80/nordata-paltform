
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { DatabaseService } from './DatabaseService';
import { RedisService } from './RedisService';
import { config } from '@/config/env';
import { logger } from '@/utils/logger';
import type { User, CreateUserData, LoginData, TokenPayload } from '@/types';

export class AuthService {
  private db: DatabaseService;
  private redis: RedisService;

  constructor() {
    this.db = new DatabaseService();
    this.redis = new RedisService();
  }

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 12);
  }

  async comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  generateAccessToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRES_IN,
    });
  }

  generateRefreshToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, config.JWT_REFRESH_SECRET, {
      expiresIn: config.JWT_REFRESH_EXPIRES_IN,
    });
  }

  verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, config.JWT_SECRET) as TokenPayload;
  }

  verifyRefreshToken(token: string): TokenPayload {
    return jwt.verify(token, config.JWT_REFRESH_SECRET) as TokenPayload;
  }

  async login(loginData: LoginData): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const { email, password } = loginData;

    // Get user by email
    const result = await this.db.query(
      'SELECT * FROM users WHERE email = $1 AND is_active = true',
      [email]
    );

    if (result.rows.length === 0) {
      throw new Error('Invalid credentials');
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await this.comparePasswords(password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Generate tokens
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.generateAccessToken(tokenPayload);
    const refreshToken = this.generateRefreshToken(tokenPayload);

    // Store refresh token in Redis
    await this.redis.set(`refresh_token:${user.id}`, refreshToken, 7 * 24 * 60 * 60); // 7 days

    // Update last login
    await this.db.query(
      'UPDATE users SET last_login_at = NOW() WHERE id = $1',
      [user.id]
    );

    const { password_hash, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, accessToken, refreshToken };
  }

  async register(userData: CreateUserData): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const { email, password, full_name, company_name, industry, role = 'client' } = userData;

    // Check if user already exists
    const existingUser = await this.db.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      throw new Error('User already exists');
    }

    // Hash password
    const password_hash = await this.hashPassword(password);

    // Create user
    const result = await this.db.query(
      `INSERT INTO users (email, password_hash, full_name, company_name, industry, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, full_name, company_name, industry, role, is_active, accepted_terms, created_at, updated_at`,
      [email, password_hash, full_name, company_name, industry, role]
    );

    const user = result.rows[0];

    // Generate tokens
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.generateAccessToken(tokenPayload);
    const refreshToken = this.generateRefreshToken(tokenPayload);

    // Store refresh token in Redis
    await this.redis.set(`refresh_token:${user.id}`, refreshToken, 7 * 24 * 60 * 60); // 7 days

    return { user, accessToken, refreshToken };
  }

  async refreshTokens(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const payload = this.verifyRefreshToken(refreshToken);
      
      // Check if refresh token exists in Redis
      const storedToken = await this.redis.get(`refresh_token:${payload.userId}`);
      if (!storedToken || storedToken !== refreshToken) {
        throw new Error('Invalid refresh token');
      }

      // Generate new tokens
      const tokenPayload = {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
      };

      const newAccessToken = this.generateAccessToken(tokenPayload);
      const newRefreshToken = this.generateRefreshToken(tokenPayload);

      // Update refresh token in Redis
      await this.redis.set(`refresh_token:${payload.userId}`, newRefreshToken, 7 * 24 * 60 * 60);

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (error) {
      logger.error('Refresh token error:', error);
      throw new Error('Invalid refresh token');
    }
  }

  async logout(userId: string): Promise<void> {
    await this.redis.del(`refresh_token:${userId}`);
  }

  async getUserById(userId: string): Promise<User | null> {
    const result = await this.db.query(
      'SELECT id, email, full_name, company_name, industry, role, is_active, accepted_terms, created_at, updated_at FROM users WHERE id = $1',
      [userId]
    );

    return result.rows[0] || null;
  }
}
