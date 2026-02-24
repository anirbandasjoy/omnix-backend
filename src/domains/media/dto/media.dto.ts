import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * DTO for uploading an avatar
 */
export class UploadAvatarDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Avatar image file',
  })
  file: any;

  @ApiPropertyOptional({
    example: 'Profile picture',
    maxLength: 255,
    description: 'Alternative text for the avatar image',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  altText?: string;

  @ApiPropertyOptional({
    example: 'My Avatar',
    maxLength: 255,
    description: 'Title for the avatar image',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;
}

/**
 * DTO for updating avatar metadata
 */
export class UpdateAvatarDto {
  @ApiPropertyOptional({
    example: 'Updated profile picture',
    maxLength: 255,
    description: 'Alternative text for the avatar image',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  altText?: string;

  @ApiPropertyOptional({
    example: 'Updated Avatar Title',
    maxLength: 255,
    description: 'Title for the avatar image',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;
}

/**
 * Response DTO for an avatar
 */
export class AvatarResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'https://cdn.example.com/avatars/123.jpg' })
  url: string;

  @ApiPropertyOptional({
    example: 'https://cdn.example.com/avatars/123-thumb.jpg',
  })
  thumbnailUrl?: string;

  @ApiProperty({ example: true, description: 'Whether the avatar is active' })
  isActive: boolean;

  @ApiProperty({
    example: false,
    description: 'Whether this is the primary/profile avatar',
  })
  isPrimary: boolean;

  @ApiPropertyOptional({ example: 'photo.jpg' })
  originalName?: string;

  @ApiPropertyOptional({ example: 102400, description: 'File size in bytes' })
  fileSize?: number;

  @ApiPropertyOptional({ example: 1920, description: 'Image width in pixels' })
  width?: number;

  @ApiPropertyOptional({ example: 1080, description: 'Image height in pixels' })
  height?: number;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;
}

/**
 * Response DTO for media statistics
 */
export class MediaStatsResponseDto {
  @ApiProperty({ example: 150, description: 'Total number of media files' })
  total: number;

  @ApiProperty({ example: 120, description: 'Number of active media files' })
  active: number;

  @ApiProperty({ example: 52428800, description: 'Total size in bytes (50MB)' })
  totalSize: number;
}
