import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as net from 'net';

/**
 * Service for checking the status of various system components.
 */
@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Performs an overall health check of all components.
   */
  async checkAll() {
    const dbStatus = await this.checkDb();
    const redisStatus = await this.checkRedis();

    return {
      status: dbStatus === 'ok' && redisStatus === 'ok' ? 'ok' : 'degraded',
      db: dbStatus,
      redis: redisStatus,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Checks database connectivity by running a simple query.
   */
  async checkDb(): Promise<string> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return 'ok';
    } catch (error) {
      this.logger.error('Database health check failed', error.stack);
      return 'error';
    }
  }

  /**
   * Checks Redis connectivity via TCP ping.
   */
  async checkRedis(): Promise<string> {
    const redisUrl = this.configService.get<string>('app.redisUrl') || '';
    const url = new URL(redisUrl);
    const host = url.hostname;
    const port = parseInt(url.port, 10) || 6379;

    return new Promise((resolve) => {
      const socket = new net.Socket();
      socket.setTimeout(2000);

      socket.on('connect', () => {
        socket.destroy();
        resolve('ok');
      });

      socket.on('timeout', () => {
        socket.destroy();
        resolve('error');
      });

      socket.on('error', () => {
        socket.destroy();
        resolve('error');
      });

      socket.connect(port, host);
    });
  }
}
