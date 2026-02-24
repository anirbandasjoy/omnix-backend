import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  UploadedFile,
} from '@nestjs/common';
import { MediaService } from '../../../../domains/media/services/media.service';
import { ActivityService } from '../../../../domains/activity/services/activity.service';
import { ActivityType } from '../../../../core/enums';
import { JwtAuthGuard } from '../../../../core/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../core/guards/roles.guard';
import { Roles } from '../../../../core/decorators/roles.decorator';
import {
  CurrentUser,
  CurrentUserData,
} from '../../../../core/decorators/current-user.decorator';
import {
  UploadAvatarDto,
  UpdateAvatarDto,
  AvatarResponseDto,
  MediaStatsResponseDto,
} from '../../../../domains/media/dto/media.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '../../../../shared/dto/common.dto';

@ApiTags('media')
@ApiBearerAuth()
@Controller('media')
@UseGuards(JwtAuthGuard)
export class MediaController {
  constructor(
    private readonly mediaService: MediaService,
    private readonly activityService: ActivityService,
  ) {}

  @Post('avatar')
  @ApiOperation({
    summary: 'Upload avatar',
    description:
      'Uploads a new avatar image for the current authenticated user. Supports common image formats (JPG, PNG, GIF, WebP).',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Avatar image file with optional metadata',
    type: UploadAvatarDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Avatar uploaded successfully',
    type: AvatarResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file format or size',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: ErrorResponseDto,
  })
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UploadAvatarDto,
    @CurrentUser() currentUser: CurrentUserData,
  ): Promise<{
    id: string;
    url: string;
    thumbnailUrl: string;
    isPrimary: boolean;
  }> {
    const result = await this.mediaService.uploadAvatar({
      userId: currentUser.id,
      file: file.buffer,
      originalName: file.originalname,
      mimeType: file.mimetype,
      fileSize: file.size,
    });

    await this.activityService.log({
      userId: currentUser.id,
      type: ActivityType.AVATAR_UPLOADED,
      action: 'upload_avatar',
      description: 'Avatar uploaded successfully',
    });

    return result;
  }

  @Get('avatar/:id')
  @ApiOperation({
    summary: 'Get avatar by ID',
    description: 'Returns details of a specific avatar image.',
  })
  @ApiParam({
    name: 'id',
    description: 'Avatar ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Avatar retrieved successfully',
    type: AvatarResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Avatar not found',
    type: ErrorResponseDto,
  })
  async getAvatar(@Param('id') id: string) {
    return this.mediaService.getAvatar(id);
  }

  @Get('avatars')
  @ApiOperation({
    summary: 'Get current user avatars',
    description: 'Returns all avatars for the current authenticated user.',
  })
  @ApiResponse({
    status: 200,
    description: 'Avatars retrieved successfully',
    type: [AvatarResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: ErrorResponseDto,
  })
  async getUserAvatars(@CurrentUser() currentUser: CurrentUserData) {
    return this.mediaService.getUserAvatars(currentUser.id);
  }

  @Patch('avatar/:id')
  @ApiOperation({
    summary: 'Update avatar metadata',
    description:
      'Updates metadata (title, alt text) for a specific avatar owned by the current user.',
  })
  @ApiParam({
    name: 'id',
    description: 'Avatar ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({ type: UpdateAvatarDto })
  @ApiResponse({
    status: 200,
    description: 'Avatar updated successfully',
    type: AvatarResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not your avatar',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Avatar not found',
    type: ErrorResponseDto,
  })
  async updateAvatar(
    @Param('id') id: string,
    @Body() updateAvatarDto: UpdateAvatarDto,
    @CurrentUser() currentUser: CurrentUserData,
  ) {
    return this.mediaService.updateAvatarMetadata(
      id,
      currentUser.id,
      updateAvatarDto,
    );
  }

  @Delete('avatar/:id')
  @ApiOperation({
    summary: 'Delete avatar',
    description: 'Deletes a specific avatar owned by the current user.',
  })
  @ApiParam({
    name: 'id',
    description: 'Avatar ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Avatar deleted successfully',
    schema: {
      example: {
        success: true,
        message: 'Avatar deleted successfully',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not your avatar',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Avatar not found',
    type: ErrorResponseDto,
  })
  async deleteAvatar(
    @Param('id') id: string,
    @CurrentUser() currentUser: CurrentUserData,
  ): Promise<{ message: string }> {
    const result = await this.mediaService.deleteAvatar(currentUser.id, id);

    await this.activityService.log({
      userId: currentUser.id,
      type: ActivityType.AVATAR_DELETED,
      action: 'delete_avatar',
      description: 'Avatar deleted successfully',
    });

    return result;
  }

  @Post('avatar/:id/set-primary')
  @ApiOperation({
    summary: 'Set avatar as profile picture',
    description:
      'Sets a specific avatar as the primary profile picture for the current user.',
  })
  @ApiParam({
    name: 'id',
    description: 'Avatar ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile avatar updated successfully',
    schema: {
      example: {
        success: true,
        message: 'Profile avatar updated',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not your avatar',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Avatar not found',
    type: ErrorResponseDto,
  })
  async setAsProfileAvatar(
    @Param('id') id: string,
    @CurrentUser() currentUser: CurrentUserData,
  ): Promise<{ message: string }> {
    const result = await this.mediaService.setAsProfileAvatar(
      currentUser.id,
      id,
    );

    await this.activityService.log({
      userId: currentUser.id,
      type: ActivityType.PROFILE_UPDATED,
      action: 'set_profile_avatar',
      description: 'Profile avatar updated',
    });

    return result;
  }

  @Get('stats')
  @Roles('admin')
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Get media statistics (Admin only)',
    description:
      'Returns system-wide media statistics including total files, active files, and total storage used.',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
    type: MediaStatsResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
    type: ErrorResponseDto,
  })
  async getStats(): Promise<MediaStatsResponseDto> {
    return this.mediaService.getStatistics();
  }
}
