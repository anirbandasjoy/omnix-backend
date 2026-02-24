import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { users, identities, profiles } from '../../../database/schema';
import { OmitId, OmitTimestamps, OmitSensitive } from '../../../shared/types';
import {
  buildResponseSchema,
  buildPaginatedResponseSchema,
} from '../../../shared/dto/response-schema-builder';

// Infer types from Drizzle schemas
export type UserSelect = typeof users.$inferSelect;
export type UserInsert = typeof users.$inferInsert;
export type IdentitySelect = typeof identities.$inferSelect;
export type IdentityInsert = typeof identities.$inferInsert;
export type ProfileSelect = typeof profiles.$inferSelect;
export type ProfileInsert = typeof profiles.$inferInsert;

// ============================================================================
// REQUEST DTOs
// ============================================================================

// Register DTO
export const RegisterDtoSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(
      /[!@#$%^&*(),.?":{}|<>]/,
      'Password must contain at least one special character',
    ),
  displayName: z
    .string()
    .min(2, 'Display name must be at least 2 characters')
    .max(100),
  firstName: z.string().min(2).max(50).optional(),
  lastName: z.string().min(2).max(50).optional(),
  locale: z.literal('en_US').optional(),
  timezone: z.literal('UTC').optional(),
});

export class RegisterDto extends createZodDto(RegisterDtoSchema) {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  email!: string;

  @ApiProperty({
    example: 'SecurePass123!',
    description:
      'User password (min 8 chars, must contain uppercase, lowercase, number, and special character)',
    minLength: 8,
  })
  password!: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'Display name',
    minLength: 2,
    maxLength: 100,
  })
  displayName!: string;

  @ApiPropertyOptional({ example: 'John', minLength: 2, maxLength: 50 })
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe', minLength: 2, maxLength: 50 })
  lastName?: string;

  @ApiPropertyOptional({
    example: 'en_US',
    default: 'en_US',
  })
  locale?: 'en_US';

  @ApiPropertyOptional({
    example: 'UTC',
    default: 'UTC',
  })
  timezone?: 'UTC';
}

// Login DTO
export const LoginDtoSchema = z.object({
  identifier: z.string().min(1, 'Identifier is required'),
  password: z.string().min(1, 'Password is required'),
  deviceInfo: z
    .object({
      deviceName: z.string().optional(),
      deviceType: z.enum(['desktop', 'mobile', 'tablet', 'unknown']).optional(),
      os: z.string().optional(),
      browser: z.string().optional(),
      fingerprint: z.string().optional(),
    })
    .optional(),
});

export class LoginDto extends createZodDto(LoginDtoSchema) {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email or username',
  })
  identifier!: string;

  @ApiProperty({ example: 'SecurePass123!', description: 'User password' })
  password!: string;

  deviceInfo?: {
    deviceName?: string;
    deviceType?: 'desktop' | 'mobile' | 'tablet' | 'unknown';
    os?: string;
    browser?: string;
    fingerprint?: string;
  };
}

// Refresh Token DTO
export const RefreshTokenDtoSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export class RefreshTokenDto extends createZodDto(RefreshTokenDtoSchema) {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT refresh token',
  })
  refreshToken!: string;
}

// Update Profile DTO
export const UpdateProfileDtoSchema = z
  .object({
    displayName: z.string().min(2).max(100).optional(),
    firstName: z.string().min(2).max(50).optional(),
    lastName: z.string().min(2).max(50).optional(),
    bio: z.string().max(500).optional(),
    dateOfBirth: z.coerce.date().optional(),
    gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
    phoneNumber: z.string().max(20).optional(),
    address: z.string().max(500).optional(),
    city: z.string().max(100).optional(),
    country: z.string().max(100).optional(),
    postalCode: z.string().max(20).optional(),
    locale: z.string().optional(),
    timezone: z.string().optional(),
    preferences: z.record(z.string(), z.any()).optional(),
  })
  .strict();

export class UpdateProfileDto extends createZodDto(UpdateProfileDtoSchema) {
  @ApiPropertyOptional({ example: 'John Doe', minLength: 2, maxLength: 100 })
  displayName?: string;

  @ApiPropertyOptional({ example: 'John', minLength: 2, maxLength: 50 })
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe', minLength: 2, maxLength: 50 })
  lastName?: string;

  @ApiPropertyOptional({ example: 'Software developer', maxLength: 500 })
  bio?: string;

  @ApiPropertyOptional({ example: '1990-01-01' })
  dateOfBirth?: Date;

  @ApiPropertyOptional({
    enum: ['male', 'female', 'other', 'prefer_not_to_say'],
  })
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';

  @ApiPropertyOptional({ example: '+1234567890', maxLength: 20 })
  phoneNumber?: string;

  @ApiPropertyOptional({ example: '123 Main St', maxLength: 500 })
  address?: string;

  @ApiPropertyOptional({ example: 'New York', maxLength: 100 })
  city?: string;

  @ApiPropertyOptional({ example: 'USA', maxLength: 100 })
  country?: string;

  @ApiPropertyOptional({ example: '10001', maxLength: 20 })
  postalCode?: string;

  @ApiPropertyOptional({ example: 'en_US' })
  locale?: string;

  @ApiPropertyOptional({ example: 'America/New_York' })
  timezone?: string;

  preferences?: Record<string, any>;
}

// Change Password DTO
export const ChangePasswordDtoSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        'Password must contain at least one special character',
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export class ChangePasswordDto extends createZodDto(ChangePasswordDtoSchema) {
  @ApiProperty({ example: 'OldPass123!', description: 'Current password' })
  currentPassword!: string;

  @ApiProperty({
    example: 'NewPass456!',
    description:
      'New password (min 8 chars, must contain uppercase, lowercase, number, and special character)',
    minLength: 8,
  })
  newPassword!: string;

  @ApiProperty({ example: 'NewPass456!', description: 'Confirm new password' })
  confirmPassword!: string;
}

// Verify Email DTO
export const VerifyEmailDtoSchema = z.object({
  code: z.string().length(6, 'Verification code must be 6 digits'),
});

export class VerifyEmailDto extends createZodDto(VerifyEmailDtoSchema) {
  @ApiProperty({
    example: '123456',
    description: '6-digit verification code',
    minLength: 6,
    maxLength: 6,
  })
  code!: string;
}

// Forgot Password DTO
export const ForgotPasswordDtoSchema = z.object({
  email: z.string().email('Invalid email format'),
});

export class ForgotPasswordDto extends createZodDto(ForgotPasswordDtoSchema) {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  email!: string;
}

// Reset Password DTO
export const ResetPasswordDtoSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        'Password must contain at least one special character',
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export class ResetPasswordDto extends createZodDto(ResetPasswordDtoSchema) {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Password reset token',
  })
  token!: string;

  @ApiProperty({
    example: 'NewPass456!',
    description:
      'New password (min 8 chars, must contain uppercase, lowercase, number, and special character)',
    minLength: 8,
  })
  newPassword!: string;

  @ApiProperty({ example: 'NewPass456!', description: 'Confirm new password' })
  confirmPassword!: string;
}

// ============================================================================
// RESPONSE DTOs
// ============================================================================

// User Response Schema
export const UserResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  displayName: z.string(),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  isActive: z.boolean(),
  isVerified: z.boolean(),
  createdAt: z.string(), // ISO date string
  updatedAt: z.string(), // ISO date string
});

export class UserResponseDto extends createZodDto(UserResponseSchema) {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id!: string;

  @ApiProperty({ example: 'user@example.com' })
  email!: string;

  @ApiProperty({ example: 'John Doe' })
  displayName!: string;

  @ApiPropertyOptional({ example: 'John' })
  firstName?: string | null;

  @ApiPropertyOptional({ example: 'Doe' })
  lastName?: string | null;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ example: true })
  isVerified!: boolean;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt!: string;
}

// User Profile Response Schema
export const UserProfileResponseSchema = z.object({
  id: z.string().uuid().optional(),
  userId: z.string().uuid(),
  displayName: z.string().nullable().optional(),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  dateOfBirth: z.string().nullable().optional(), // ISO date string
  gender: z
    .enum(['male', 'female', 'other', 'prefer_not_to_say'])
    .nullable()
    .optional(),
  phoneNumber: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  postalCode: z.string().nullable().optional(),
  locale: z.string().nullable().optional(),
  timezone: z.string().nullable().optional(),
  preferences: z.record(z.string(), z.any()).nullable().optional(),
  avatarUrl: z.string().nullable().optional(),
  createdAt: z.string().optional(), // ISO date string
  updatedAt: z.string().optional(), // ISO date string
});

export class UserProfileResponseDto extends createZodDto(
  UserProfileResponseSchema,
) {
  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id?: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  userId!: string;

  @ApiPropertyOptional({ example: 'John Doe' })
  displayName?: string | null;

  @ApiPropertyOptional({ example: 'John' })
  firstName?: string | null;

  @ApiPropertyOptional({ example: 'Doe' })
  lastName?: string | null;

  @ApiPropertyOptional({ example: 'Software developer' })
  bio?: string | null;

  @ApiPropertyOptional({ example: '1990-01-01' })
  dateOfBirth?: string | null;

  @ApiPropertyOptional({
    enum: ['male', 'female', 'other', 'prefer_not_to_say'],
  })
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;

  @ApiPropertyOptional({ example: '+1234567890' })
  phoneNumber?: string | null;

  @ApiPropertyOptional({ example: '123 Main St' })
  address?: string | null;

  @ApiPropertyOptional({ example: 'New York' })
  city?: string | null;

  @ApiPropertyOptional({ example: 'USA' })
  country?: string | null;

  @ApiPropertyOptional({ example: '10001' })
  postalCode?: string | null;

  @ApiPropertyOptional({ example: 'en_US' })
  locale?: string | null;

  @ApiPropertyOptional({ example: 'America/New_York' })
  timezone?: string | null;

  preferences?: Record<string, any> | null;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/avatars/123.jpg' })
  avatarUrl?: string | null;

  @ApiPropertyOptional({ example: '2024-01-01T00:00:00.000Z' })
  createdAt?: string;

  @ApiPropertyOptional({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt?: string;
}

// Identity Response Schema
export const IdentityResponseSchema = z.object({
  id: z.string().uuid().optional(),
  userId: z.string().uuid(),
  provider: z.string(),
  providerId: z.string(),
  accessToken: z.string().nullable().optional(),
  refreshToken: z.string().nullable().optional(),
  expiresAt: z.string().nullable().optional(), // ISO date string
  createdAt: z.string().optional(), // ISO date string
  updatedAt: z.string().optional(), // ISO date string
});

export class IdentityResponseDto extends createZodDto(IdentityResponseSchema) {
  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id?: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  userId!: string;

  @ApiProperty({ example: 'google' })
  provider!: string;

  @ApiProperty({ example: '123456789' })
  providerId!: string;

  @ApiPropertyOptional()
  accessToken?: string | null;

  @ApiPropertyOptional()
  refreshToken?: string | null;

  @ApiPropertyOptional({ example: '2024-12-31T23:59:59.000Z' })
  expiresAt?: string | null;

  @ApiPropertyOptional({ example: '2024-01-01T00:00:00.000Z' })
  createdAt?: string;

  @ApiPropertyOptional({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt?: string;
}

// Login Response Schema (internal use)
export const LoginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: UserResponseSchema,
});

export class LoginResponseDto extends createZodDto(LoginResponseSchema) {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken!: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  refreshToken!: string;

  @ApiProperty({ type: UserResponseDto })
  user!: UserResponseDto;
}

// ============================================================================
// RESPONSE SCHEMAS WITH WRAPPER (for @ZodResponse)
// ============================================================================

// Register Response Schema
export const RegisterResponseSchema = buildResponseSchema(UserResponseSchema);

export class RegisterResponseDto extends createZodDto(RegisterResponseSchema) {}

// Login Response Schema with wrapper
export const LoginDataResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: UserResponseSchema,
});

export const LoginResponseWrapperSchema = buildResponseSchema(
  LoginDataResponseSchema,
);

export class LoginResponseWrapperDto extends createZodDto(
  LoginResponseWrapperSchema,
) {}

// Empty success response (for logout, password change, etc.)
export const EmptyResponseSchema = buildResponseSchema(z.object({}));

export class EmptyResponseDto extends createZodDto(EmptyResponseSchema) {}

// Paginated users response
export const GetUsersResponseSchema =
  buildPaginatedResponseSchema(UserResponseSchema);

export class GetUsersResponseDto extends createZodDto(GetUsersResponseSchema) {}

// ============================================================================
// LEGACY TYPE EXPORTS (for backward compatibility)
// ============================================================================

export type UserResponseDtoLegacy = OmitSensitive<UserSelect>;
export type UserProfileResponseDtoLegacy = OmitId<
  OmitTimestamps<ProfileSelect>
> & {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
};
export type IdentityResponseDtoLegacy = OmitSensitive<
  OmitTimestamps<IdentitySelect>
> & {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
};
