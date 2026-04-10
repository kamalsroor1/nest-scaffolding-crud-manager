import { Test, TestingModule } from '@nestjs/testing';
import { HealthService } from './health.service';
import { PrismaService } from '../../database/prisma.service';
import { ConfigService } from '@nestjs/config';

describe('HealthService', () => {
  let service: HealthService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        {
          provide: PrismaService,
          useValue: {
            $queryRaw: jest.fn().mockResolvedValue([{ 1: 1 }]),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('localhost'),
          },
        },
      ],
    }).compile();

    service = module.get<HealthService>(HealthService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return ok for database check on success', async () => {
    const result = await service.checkDb();
    expect(result).toBe('ok');
    expect(prisma.$queryRaw).toHaveBeenCalled();
  });

  it('should return error for database check on failure', async () => {
    jest.spyOn(prisma, '$queryRaw').mockRejectedValue(new Error('DB Down'));
    const result = await service.checkDb();
    expect(result).toBe('error');
  });
});
