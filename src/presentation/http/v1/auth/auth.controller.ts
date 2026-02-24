/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/require-await */
import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
} from '@nestjs/common';
import { AuthService } from '../../../../domains/auth/services/auth.service';
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  VerifyEmailDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
} from '../../../../domains/user/dto/user.dto';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CurrentUser, DeviceInfo, Public } from 'src/core/decorators';

@ApiTags('auth')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new user',
    description:
      'Creates a new user account with email and password. A verification email will be sent.',
  })
  @ApiBody({
    type: RegisterDto,
    description: 'User registration details',
  })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  @ApiResponse({
    status: 409,
    description: 'User already exists',
  })
  async register(
    @Body() registerDto: RegisterDto,
    @DeviceInfo() deviceInfo: any,
  ) {
    const result = await this.authService.register(registerDto, deviceInfo);
    return {
      message: 'Registration successful',
      data: result,
    };
  }

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User login',
    description:
      'Authenticate user with email/username and password. Returns access and refresh tokens.',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
  })
  async login(@Body() loginDto: LoginDto, @DeviceInfo() deviceInfo: any) {
    const result = await this.authService.login(loginDto, deviceInfo);
    return {
      message: 'Login successful',
      data: result,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'User logout',
    description: 'Logout the current user and invalidate their refresh token.',
  })
  @ApiBody({
    description: 'Optional logout settings',
    schema: {
      type: 'object',
      properties: {
        logoutAllDevices: {
          type: 'boolean',
          description: 'Logout from all devices or just current device',
          example: false,
        },
      },
    },
  })
  @ApiResponse({ status: 204, description: 'Logout successful' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async logout(
    @CurrentUser('id') userId: string,
    @DeviceInfo('fingerprint') deviceId: string,
    @Body() body?: { logoutAllDevices?: boolean },
  ) {
    await this.authService.logout(userId, deviceId, body?.logoutAllDevices);
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Get a new access token using a valid refresh token.',
  })
  @ApiBody({
    type: RefreshTokenDto,
    description: 'Refresh token from login response',
  })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired refresh token',
  })
  async refresh(
    @Body() refreshTokenDto: RefreshTokenDto,
    @DeviceInfo() deviceInfo: any,
  ) {
    const result = await this.authService.refreshTokens(
      refreshTokenDto.refreshToken,
      deviceInfo,
    );
    return {
      message: 'Token refreshed successfully',
      data: result,
    };
  }

  @Post('verify/email')
  @ApiOperation({
    summary: 'Verify email address',
    description:
      'Verify user email using the 6-digit code sent to their email.',
  })
  @ApiBody({
    type: VerifyEmailDto,
    description: '6-digit verification code from email',
  })
  @ApiResponse({
    status: 200,
    description: 'Email verified successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired verification code',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async verifyEmail(
    @CurrentUser('id') userId: string,
    @Body() verifyEmailDto: VerifyEmailDto,
  ) {
    return this.authService.verifyEmail(userId, verifyEmailDto.code);
  }

  @Post('verify/resend')
  @ApiOperation({
    summary: 'Resend verification email',
    description: 'Request a new verification email to be sent.',
  })
  @ApiResponse({
    status: 200,
    description: 'Verification email sent successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Email already verified',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests - please wait before resending',
  })
  async resendVerification(@CurrentUser('id') userId: string) {
    return { message: 'Verification email sent' };
  }

  @Post('password/reset/request')
  @Public()
  @ApiOperation({
    summary: 'Request password reset',
    description: 'Request a password reset email to be sent.',
  })
  @ApiBody({
    type: ForgotPasswordDto,
    description: 'Email address for password reset',
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset email sent',
  })
  @ApiResponse({
    status: 400,
    description: 'Email not found',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests',
  })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Post('password/reset/complete')
  @Public()
  @ApiOperation({
    summary: 'Complete password reset',
    description: 'Reset user password using the token received in email.',
  })
  @ApiBody({
    type: ResetPasswordDto,
    description: 'Password reset token and new password',
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired token',
  })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.newPassword,
    );
  }

  @Post('password/change')
  @ApiOperation({
    summary: 'Change password',
    description:
      'Change user password. Requires current password for verification.',
  })
  @ApiBody({
    type: ChangePasswordDto,
    description: 'Current password and new password',
  })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid current password',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async changePassword(
    @CurrentUser('id') userId: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(
      userId,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword,
    );
  }

  @Get('me')
  @ApiOperation({
    summary: 'Get current user',
    description: 'Get the currently authenticated user details.',
  })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getCurrentUser(@CurrentUser('id') userId: string) {
    return { message: 'User retrieved successfully', user: { id: userId } };
  }
}
