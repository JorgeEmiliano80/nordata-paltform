
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { config } from '@/config/env';
import { logger } from '@/utils/logger';
import { errorHandler } from '@/middleware/errorHandler';
import { notFoundHandler } from '@/middleware/notFoundHandler';
import { DatabaseService } from '@/services/DatabaseService';
import { RedisService } from '@/services/RedisService';

// Import routes
import authRoutes from '@/routes/auth';
import userRoutes from '@/routes/users';
import fileRoutes from '@/routes/files';
import analyticsRoutes from '@/routes/analytics';
import chatbotRoutes from '@/routes/chatbot';
import adminRoutes from '@/routes/admin';

class Server {
  private app: express.Application;
  private database: DatabaseService;
  private redis: RedisService;

  constructor() {
    this.app = express();
    this.database = new DatabaseService();
    this.redis = new RedisService();
    
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddleware(): void {
    // Security middleware
    this.app.use(helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" }
    }));

    // CORS configuration
    this.app.use(cors({
      origin: config.FRONTEND_URL,
      credentials: true,
      optionsSuccessStatus: 200
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP'
    });
    this.app.use('/api', limiter);

    // Body parsing and compression
    this.app.use(compression());
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());

    // Logging
    if (config.NODE_ENV === 'development') {
      this.app.use(morgan('dev'));
    } else {
      this.app.use(morgan('combined'));
    }

    // Health check
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: config.NODE_ENV,
        version: '1.0.0'
      });
    });
  }

  private initializeRoutes(): void {
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/users', userRoutes);
    this.app.use('/api/files', fileRoutes);
    this.app.use('/api/analytics', analyticsRoutes);
    this.app.use('/api/chatbot', chatbotRoutes);
    this.app.use('/api/admin', adminRoutes);
  }

  private initializeErrorHandling(): void {
    this.app.use(notFoundHandler);
    this.app.use(errorHandler);
  }

  public async start(): Promise<void> {
    try {
      // Initialize database
      await this.database.connect();
      logger.info('Database connected successfully');

      // Initialize Redis
      await this.redis.connect();
      logger.info('Redis connected successfully');

      // Start server
      this.app.listen(config.PORT, () => {
        logger.info(`🚀 Server running on ${config.HOST}:${config.PORT}`);
        logger.info(`📊 Environment: ${config.NODE_ENV}`);
      });
    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  public async stop(): Promise<void> {
    await this.database.disconnect();
    await this.redis.disconnect();
    logger.info('Server stopped gracefully');
  }
}

// Initialize and start server
const server = new Server();

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received');
  await server.stop();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received');
  await server.stop();
  process.exit(0);
});

// Start server
server.start().catch((error) => {
  logger.error('Unhandled error:', error);
  process.exit(1);
});
