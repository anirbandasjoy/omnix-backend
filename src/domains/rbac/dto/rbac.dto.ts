import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { buildResponseSchema } from '../../../shared/dto/response-schema-builder';

/**
 * DTO for creating a new role
 */
export class CreateRoleDto {
  @ApiProperty({
    example: 'editor',
    maxLength: 50,
    description: 'Name of the role',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiPropertyOptional({
    example: 'Can edit and publish content',
    maxLength: 255,
    description: 'Description of the role',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['post:create', 'post:update', 'post:delete'],
    description: 'List of permission IDs to assign to this role',
  })
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];
}

/**
 * DTO for updating a role
 */
export class UpdateRoleDto {
  @ApiPropertyOptional({
    example: 'senior-editor',
    maxLength: 50,
    description: 'New name for the role',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;

  @ApiPropertyOptional({
    example: 'Can edit, publish, and moderate content',
    maxLength: 255,
    description: 'Updated description of the role',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}

/**
 * DTO for creating a new permission
 */
export class CreatePermissionDto {
  @ApiProperty({
    example: 'post.create',
    maxLength: 100,
    description: 'Name of the permission (typically resource:action format)',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    example: 'post',
    maxLength: 50,
    description: 'Resource this permission applies to',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  resource: string;

  @ApiProperty({
    example: 'create',
    maxLength: 50,
    description: 'Action that can be performed on the resource',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  action: string;

  @ApiPropertyOptional({
    example: 'Allows creating new blog posts',
    maxLength: 255,
    description: 'Description of what this permission allows',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}

/**
 * DTO for updating a permission
 */
export class UpdatePermissionDto {
  @ApiPropertyOptional({
    example: 'blog.create',
    maxLength: 100,
    description: 'New name for the permission',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    example: 'Allows creating new blog posts',
    maxLength: 255,
    description: 'Updated description of the permission',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}

/**
 * DTO for assigning roles to a user
 */
export class AssignRoleDto {
  @ApiProperty({
    type: [String],
    example: ['550e8400-e29b-41d4-a716-446655440000'],
    description: 'Array of role IDs to assign to the user',
  })
  @IsArray()
  @IsString({ each: true })
  roleIds: string[];
}

/**
 * DTO for assigning permissions to a role
 */
export class AssignPermissionDto {
  @ApiProperty({
    type: [String],
    example: ['550e8400-e29b-41d4-a716-446655440000'],
    description: 'Array of permission IDs to assign to the role',
  })
  @IsArray()
  @IsString({ each: true })
  permissionIds: string[];
}

/**
 * Response DTO for a permission
 */
export class PermissionResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'user.create' })
  name: string;

  @ApiProperty({ example: 'user' })
  resource: string;

  @ApiProperty({ example: 'create' })
  action: string;

  @ApiPropertyOptional({ example: 'Allows creating new users' })
  description?: string;

  @ApiPropertyOptional({ example: '2024-01-01T00:00:00.000Z' })
  createdAt?: string;

  @ApiPropertyOptional({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt?: string;
}

/**
 * Response DTO for a role
 */
export class RoleResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'admin' })
  name: string;

  @ApiPropertyOptional({ example: 'Administrator with full access' })
  description?: string;

  @ApiProperty({
    type: [PermissionResponseDto],
    description: 'Permissions assigned to this role',
  })
  permissions: PermissionResponseDto[];

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: string;
}

// ============================================================================
// RESPONSE SCHEMAS WITH WRAPPER (for @ZodResponse)
// ============================================================================

// Role schemas
const RoleDataSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  permissions: z.array(
    z.object({
      id: z.string().uuid(),
      name: z.string(),
      resource: z.string(),
      action: z.string(),
      description: z.string().optional(),
    }),
  ),
  createdAt: z.string(), // ISO date string
  updatedAt: z.string(), // ISO date string
});

// Permission schemas
const PermissionDataSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  resource: z.string(),
  action: z.string(),
  description: z.string().optional(),
});

// Response DTOs
export const RoleResponseSchema = buildResponseSchema(RoleDataSchema);
export class RoleResponseWrapperDto extends createZodDto(RoleResponseSchema) {}

export const PermissionResponseSchema =
  buildResponseSchema(PermissionDataSchema);
export class PermissionResponseWrapperDto extends createZodDto(
  PermissionResponseSchema,
) {}

// Array responses
export const RolesListResponseSchema = buildResponseSchema(
  z.array(RoleDataSchema),
);
export class RolesListResponseDto extends createZodDto(
  RolesListResponseSchema,
) {}

export const PermissionsListResponseSchema = buildResponseSchema(
  z.array(PermissionDataSchema),
);
export class PermissionsListResponseDto extends createZodDto(
  PermissionsListResponseSchema,
) {}

// Empty response
export const EmptyResponseSchema = buildResponseSchema(z.object({}));
export class EmptyResponseDto extends createZodDto(EmptyResponseSchema) {}
