
import Redis from 'ioredis';
import { config } from '@/config/env';
import { logger } from '@/utils/logger';

export class RedisService {
  private client: Redis;

  constructor() {
    this.client = new Redis({
      host: config.REDIS_HOST,
      port: config.REDIS_PORT,
      password: config.REDIS_PASSWORD,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
    });

    this.client.on('connect', () => {
      logger.info('Redis connected');
    });

    this.client.on('error', (err) => {
      logger.error('Redis error:', err);
    });
  }

  public async connect(): Promise<void> {
    await this.client.ping();
  }

  public async disconnect(): Promise<void> {
    await this.client.disconnect();
    logger.info('Redis disconnected');
  }

  public async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.client.setex(key, ttl, value);
    } else {
      await this.client.set(key, value);
    }
  }

  public async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  public async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  public async exists(key: string): Promise<boolean> {
    return (await this.client.exists(key)) === 1;
  }

  public async expire(key: string, seconds: number): Promise<void> {
    await this.client.expire(key, seconds);
  }

  public getClient(): Redis {
    return this.client;
  }
}
