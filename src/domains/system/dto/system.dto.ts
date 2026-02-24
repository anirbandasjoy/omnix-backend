import { ApiProperty } from '@nestjs/swagger';

/**
 * Response DTO for health check
 */
export class HealthResponseDto {
  @ApiProperty({ example: 'ok', description: 'Health status' })
  status: string;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Current timestamp',
  })
  timestamp: string;

  @ApiProperty({ example: 86400, description: 'Server uptime in seconds' })
  uptime: number;

  @ApiProperty({ example: '1.0.0', description: 'Application version' })
  version: string;
}

/**
 * Response DTO for system information
 */
export class SystemInfoResponseDto {
  @ApiProperty({ example: '1.0.0', description: 'Application version' })
  version: string;

  @ApiProperty({ example: 'development', description: 'Current environment' })
  environment: string;

  @ApiProperty({ example: 'v20.0.0', description: 'Node.js version' })
  nodeVersion: string;
}

/**
 * Response DTO for system statistics
 */
export class SystemStatsResponseDto {
  @ApiProperty({ example: 150, description: 'Total number of users' })
  users: number;

  @ApiProperty({ example: 45, description: 'Active sessions' })
  sessions: number;

  @ApiProperty({ example: 1250, description: 'Total activities logged' })
  activities: number;

  @ApiProperty({ example: 320, description: 'Total media files' })
  media: number;

  @ApiProperty({ example: 5, description: 'Total roles' })
  roles: number;

  @ApiProperty({ example: 25, description: 'Total permissions' })
  permissions: number;
}
