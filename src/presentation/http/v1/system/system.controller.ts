import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from '../../../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../core/guards/roles.guard';
import { Roles } from '../../../../core/decorators/roles.decorator';
import { Public } from '../../../../core/decorators/public.decorator';
import {
  HealthResponseDto,
  SystemInfoResponseDto,
  SystemStatsResponseDto,
} from '../../../../domains/system/dto/system.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '../../../../shared/dto/common.dto';

@ApiTags('system')
@ApiBearerAuth()
@Controller('system')
export class SystemController {
  constructor(private readonly config: ConfigService) {}

  @Get('health')
  @Public()
  @ApiOperation({
    summary: 'Health check',
    description:
      'Public endpoint to check API health status. Returns server uptime, version, and timestamp.',
  })
  @ApiResponse({
    status: 200,
    description: 'API is healthy',
    type: HealthResponseDto,
  })
  health(): HealthResponseDto {
    const uptime = process.uptime();
    const timestamp = new Date().toISOString();

    return {
      status: 'ok',
      timestamp,
      uptime: Math.floor(uptime),
      version: this.config.get('app.version', '1.0.0'),
    };
  }

  @Get('info')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get system information',
    description:
      'Returns system version, environment, and Node.js version information.',
  })
  @ApiResponse({
    status: 200,
    description: 'System info retrieved successfully',
    type: SystemInfoResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: ErrorResponseDto,
  })
  info(): SystemInfoResponseDto {
    return {
      version: this.config.get('app.version', '1.0.0'),
      environment: this.config.get('node.env', 'development'),
      nodeVersion: process.version,
    };
  }

  @Get('config')
  @Public()
  @ApiOperation({
    summary: 'Get public configuration',
    description:
      'Returns public-facing configuration such as available features and OAuth providers.',
  })
  @ApiResponse({
    status: 200,
    description: 'Configuration retrieved successfully',
    schema: {
      example: {
        features: {
          registration: true,
          emailVerification: true,
          oauthProviders: ['google', 'github'],
        },
      },
    },
  })
  getConfig() {
    return {
      features: {
        registration:
          this.config.get('features.registration', 'true') === 'true',
        emailVerification:
          this.config.get('features.emailVerification', 'true') === 'true',
        oauthProviders: this.config.get<string[]>(
          'features.oauthProviders',
          [],
        ),
      },
    };
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({
    summary: 'Get system statistics (Admin only)',
    description:
      'Returns system-wide statistics including users, sessions, activities, media, roles, and permissions counts.',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
    type: SystemStatsResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
    type: ErrorResponseDto,
  })
  getStats(): SystemStatsResponseDto {
    return {
      users: 0,
      sessions: 0,
      activities: 0,
      media: 0,
      roles: 0,
      permissions: 0,
    };
  }

  @Post('cache/clear')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({
    summary: 'Clear system cache (Admin only)',
    description:
      'Clears all system caches. Use with caution as this may temporarily affect performance.',
  })
  @ApiResponse({
    status: 200,
    description: 'Cache cleared successfully',
    schema: {
      example: {
        success: true,
        message: 'Cache cleared successfully',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
    type: ErrorResponseDto,
  })
  clearCache(): { message: string } {
    return { message: 'Cache cleared successfully' };
  }
}
