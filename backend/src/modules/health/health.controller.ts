import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';

/**
 * Controller for health check endpoints.
 */
@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Check overall system health' })
  @ApiResponse({ status: 200, description: 'Overall system status' })
  async check() {
    return this.healthService.checkAll();
  }

  @Get('db')
  @ApiOperation({ summary: 'Check database connectivity' })
  @ApiResponse({ status: 200, description: 'Database status' })
  async checkDb() {
    const status = await this.healthService.checkDb();
    return { status };
  }

  @Get('redis')
  @ApiOperation({ summary: 'Check Redis connectivity' })
  @ApiResponse({ status: 200, description: 'Redis status' })
  async checkRedis() {
    const status = await this.healthService.checkRedis();
    return { status };
  }
}
