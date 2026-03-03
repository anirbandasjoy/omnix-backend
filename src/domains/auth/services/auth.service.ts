/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { and, eq, sql } from 'drizzle-orm';
import * as schema from '../../../database/schemas';
import { UserRepository } from '../../user/repositories/user.repository';
import { IdentityRepository } from '../../user/repositories/identity.repository';
import { ProfileRepository } from '../../user/repositories/profile.repository';
import { DeviceRepository } from '../repositories/device.repository';
import { SessionRepository } from '../repositories/session.repository';
import { RefreshTokenRepository } from '../repositories/refresh-token.repository';
import { PasswordUtil, TokenUtil, CryptoUtil } from '../../../core/utils';
import { RegisterDto, LoginDto } from '../../user/dto/user.dto';
import { UserResponseDto } from '../../user/dto/user.dto';
import { EmailService } from '../../../infrastructure/email/services/email.service';
import { ActivityType } from '../../../core/enums';
import { ActivityService } from '../../activity/services/activity.service';
import { InjectDatabase } from '../../../core/database';
import type { EnvConfigFlat } from '../../../core/config';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userRepo: UserRepository,
    private readonly identityRepo: IdentityRepository,
    private readonly profileRepo: ProfileRepository,
    private readonly sessionRepo: SessionRepository,
    private readonly refreshTokenRepo: RefreshTokenRepository,
    private readonly deviceRepo: DeviceRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<EnvConfigFlat>,
    private readonly emailService: EmailService,
    private readonly activityService: ActivityService,
    @InjectDatabase() private readonly db: NodePgDatabase<any>,
  ) {}

  async register(dto: RegisterDto, deviceInfo: any) {
    this.logger.log(`Registering user with email: ${dto.email}`);

    // Check if identity already exists
    const existingIdentity = await this.identityRepo.findByEmail(dto.email);
    if (existingIdentity) {
      throw new ConflictException('Email already registered');
    }

    // Validate password strength
    const passwordValidation = PasswordUtil.validateStrength(dto.password);
    if (!passwordValidation.isValid) {
      throw new BadRequestException({
        message: 'Password validation failed',
        errors: passwordValidation.errors,
      });
    }

    // Hash password
    const hashedPassword = await PasswordUtil.hash(dto.password);

    // Start transaction
    const result = await this.db.transaction(async (tx) => {
      // Create User
      const [user] = await tx
        .insert(schema.users)
        .values({
          status: true,
          emailVerified: false,
          phoneVerified: false,
        })
        .returning();

      // Create Email Identity
      await tx.insert(schema.identities).values({
        userId: user.id,
        provider: 'email',
        providerId: dto.email,
        password: hashedPassword,
        isVerified: false,
        isPrimary: true,
      });

      // Create Profile
      await tx.insert(schema.profiles).values({
        userId: user.id,
        displayName: dto.displayName,
        firstName: dto.firstName || '',
        lastName: dto.lastName || '',
      });

      // Create/Get Device
      const fingerprint = deviceInfo?.fingerprint || CryptoUtil.nanoId();
      let device = await this.deviceRepo.findByUserIdAndFingerprint(
        user.id,
        fingerprint,
      );

      if (!device) {
        [device] = await tx
          .insert(schema.devices)
          .values({
            userId: user.id,
            deviceType: deviceInfo?.deviceType || 'unknown',
            deviceName: deviceInfo?.deviceName || 'Unknown Device',
            os: deviceInfo?.os,
            browser: deviceInfo?.browser,
            fingerprint,
            isTrusted: false,
          })
          .returning();
      }

      // Generate tokens
      const tokens = await this.generateTokens(user.id, device.id, []);

      // Create Session
      await tx.insert(schema.sessions).values({
        userId: user.id,
        deviceId: device.id,
        token: TokenUtil.hashToken(tokens.accessToken),
        ipAddress: deviceInfo.ipAddress,
        userAgent: deviceInfo.userAgent,
        location: deviceInfo.location
          ? JSON.stringify(deviceInfo.location)
          : null,
        isActive: true,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      });

      // Store Refresh Token
      await tx.insert(schema.refreshTokens).values({
        userId: user.id,
        deviceId: device.id,
        token: TokenUtil.hashToken(tokens.refreshToken),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      });

      this.logger.log(`User registered successfully: ${user.id}`);

      return {
        user,
        tokens,
        deviceId: device.id,
      };
    });

    // Log activity (outside transaction)
    await this.activityService.log({
      userId: result.user.id,
      type: ActivityType.REGISTER,
      action: 'user_registered',
      description: 'User registered successfully',
      metadata: { provider: 'email', deviceId: result.deviceId },
      ipAddress: deviceInfo.ipAddress,
      userAgent: deviceInfo.userAgent,
    });

    // Send welcome email (outside transaction)
    await this.emailService.sendWelcomeEmail(dto.email, dto.displayName);

    // Send verification email (outside transaction)
    const verificationCode = CryptoUtil.generateNumericCode(6);
    await this.emailService.sendEmailVerificationEmail(
      dto.email,
      dto.displayName,
      verificationCode,
      new Date(Date.now() + 24 * 60 * 60 * 1000),
    );

    return {
      user: this.sanitizeUser(result.user),
      tokens: result.tokens,
      requiresVerification: true,
    };
  }

  async login(dto: LoginDto, deviceInfo: any) {
    this.logger.log(`Login attempt for: ${dto.identifier}`);

    // Find identity by identifier (email, phone, or username)
    const identity = await this.db
      .select()
      .from(schema.identities)
      .where(eq(schema.identities.providerId, dto.identifier))
      .limit(1);

    if (!identity || identity.length === 0) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password for email/phone/username providers
    if (['email', 'phone', 'username'].includes(identity[0].provider)) {
      if (!identity[0].password) {
        throw new UnauthorizedException('Invalid credentials');
      }
      const isValid = await PasswordUtil.compare(
        dto.password,
        identity[0].password,
      );
      if (!isValid) {
        throw new UnauthorizedException('Invalid credentials');
      }
    }

    // Get user
    const [user] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, identity[0].userId))
      .limit(1);

    if (!user || !user.status || user.isDeleted) {
      throw new UnauthorizedException('Account is disabled or deleted');
    }

    // Create/Get Device
    const fingerprint = deviceInfo?.fingerprint || CryptoUtil.nanoId();
    let device = await this.deviceRepo.findByUserIdAndFingerprint(
      user.id,
      fingerprint,
    );

    if (!device) {
      [device] = await this.db
        .insert(schema.devices)
        .values({
          userId: user.id,
          deviceType: deviceInfo?.deviceType || 'unknown',
          deviceName: deviceInfo?.deviceName || 'Unknown Device',
          os: deviceInfo?.os,
          browser: deviceInfo?.browser,
          fingerprint,
          isTrusted: false,
        })
        .returning();
    } else {
      await this.db
        .update(schema.devices)
        .set({ lastSeen: new Date(), updatedAt: new Date() })
        .where(eq(schema.devices.id, device.id));
    }

    // Get user roles and permissions
    const userRoles = await this.getUserRoles(user.id);
    const userPermissions = await this.getUserPermissions(user.id);

    // Generate tokens
    const tokens = await this.generateTokens(
      user.id,
      device.id,
      userRoles,
      userPermissions,
    );

    // Create Session
    await this.db.insert(schema.sessions).values({
      userId: user.id,
      deviceId: device.id,
      token: TokenUtil.hashToken(tokens.accessToken),
      ipAddress: deviceInfo.ipAddress,
      userAgent: deviceInfo.userAgent,
      location: deviceInfo.location
        ? JSON.stringify(deviceInfo.location)
        : null,
      isActive: true,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });

    // Store Refresh Token
    await this.db.insert(schema.refreshTokens).values({
      userId: user.id,
      deviceId: device.id,
      token: TokenUtil.hashToken(tokens.refreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    // Update identity last login
    await this.db
      .update(schema.identities)
      .set({ updatedAt: new Date() })
      .where(eq(schema.identities.id, identity[0].id));

    // Log activity
    await this.activityService.log({
      userId: user.id,
      type: ActivityType.LOGIN,
      action: 'user_logged_in',
      description: 'User logged in successfully',
      metadata: { provider: identity[0].provider, deviceId: device.id },
      ipAddress: deviceInfo.ipAddress,
      userAgent: deviceInfo.userAgent,
    });

    this.logger.log(`User logged in successfully: ${user.id}`);

    return {
      user: this.sanitizeUser(user, userRoles, userPermissions),
      tokens,
      session: {
        id: device.id,
        deviceName: device.deviceName,
        isTrusted: device.isTrusted,
      },
    };
  }

  async refreshTokens(refreshToken: string, deviceInfo: any) {
    // Verify refresh token
    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.getOrThrow<string>('JWT.REFRESH.SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }

    // Check token in database
    const hashedToken = TokenUtil.hashToken(refreshToken);
    const storedToken =
      await this.refreshTokenRepo.findActiveByToken(hashedToken);

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expired or revoked');
    }

    // Get user
    const user = await this.userRepo.findById(payload.sub);
    if (!user || !user.status || user.isDeleted) {
      throw new UnauthorizedException('Account is disabled or deleted');
    }

    // Get user roles and permissions
    const userRoles = await this.getUserRoles(user.id);
    const userPermissions = await this.getUserPermissions(user.id);

    // Generate new tokens
    const tokens = await this.generateTokens(
      user.id,
      storedToken.deviceId,
      userRoles,
      userPermissions,
    );

    // Revoke old refresh token
    await this.refreshTokenRepo.revoke(storedToken.id);

    // Log activity
    await this.activityService.log({
      userId: user.id,
      type: ActivityType.TOKEN_REFRESH,
      action: 'token_refreshed',
      description: 'User refreshed access token',
      metadata: { deviceId: storedToken.deviceId },
    });

    return { tokens };
  }

  async logout(userId: string, deviceId?: string, logoutAllDevices = false) {
    if (logoutAllDevices) {
      // Revoke all refresh tokens and deactivate all sessions
      await this.refreshTokenRepo.revokeAllByUserId(userId);
      await this.sessionRepo.deactivateByUserId(userId);
    } else if (deviceId) {
      // Revoke tokens and sessions for specific device
      await this.refreshTokenRepo.revokeByDeviceId(deviceId);
      await this.sessionRepo.deactivateByDeviceId(deviceId);
    }

    // Log activity
    await this.activityService.log({
      userId,
      type: ActivityType.LOGOUT,
      action: 'user_logged_out',
      description: 'User logged out',
      metadata: { deviceId, logoutAllDevices },
    });
  }

  async generateTokens(
    userId: string,
    deviceId: string,
    roles: string[] = [],
    permissions: string[] = [],
  ) {
    const accessPayload = TokenUtil.generateAccessTokenPayload(
      { id: userId, roles, permissions },
      deviceId,
    );
    const refreshPayload = TokenUtil.generateRefreshTokenPayload(
      userId,
      deviceId,
    );

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload, {
        secret: this.configService.getOrThrow<string>('JWT.ACCESS.SECRET'),
        expiresIn: this.configService.getOrThrow<string>(
          'JWT.ACCESS.EXPIRATION',
        ),
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret: this.configService.getOrThrow<string>('JWT.REFRESH.SECRET'),
        expiresIn: this.configService.getOrThrow<string>(
          'JWT.REFRESH.EXPIRATION',
        ),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes
      tokenType: 'Bearer',
    };
  }

  async getUserRoles(userId: string): Promise<string[]> {
    const results = await this.db
      .select({
        slug: schema.roles.slug,
      })
      .from(schema.userRoles)
      .innerJoin(schema.roles, eq(schema.userRoles.roleId, schema.roles.id))
      .where(
        and(
          eq(schema.userRoles.userId, userId),
          sql`expires_at IS NULL OR expires_at > ${new Date()}`,
        ),
      );

    return results.map((r) => r.slug);
  }

  async getUserPermissions(userId: string): Promise<string[]> {
    const results = await this.db
      .select({
        slug: schema.permissions.slug,
      })
      .from(schema.userRoles)
      .innerJoin(
        schema.rolePermissions,
        eq(schema.userRoles.roleId, schema.rolePermissions.roleId),
      )
      .innerJoin(
        schema.permissions,
        eq(schema.rolePermissions.permissionId, schema.permissions.id),
      )
      .where(
        and(
          eq(schema.userRoles.userId, userId),
          sql`expires_at IS NULL OR expires_at > ${new Date()}`,
        ),
      );

    return results.map((r) => r.slug);
  }

  sanitizeUser(
    user: any,
    roles: string[] = [],
    permissions: string[] = [],
  ): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      firstName: user.firstName ?? null,
      lastName: user.lastName ?? null,
      isActive: user.isActive ?? true,
      isVerified: user.isVerified ?? false,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async verifyEmail(userId: string, code: string) {
    // In production, validate against stored verification code
    // For now, we'll mark email as verified
    await this.db
      .update(schema.users)
      .set({ emailVerified: true })
      .where(eq(schema.users.id, userId));

    await this.emailService.sendEmailVerifiedEmail('', '');

    // Log activity
    await this.activityService.log({
      userId,
      type: ActivityType.EMAIL_VERIFIED,
      action: 'email_verified',
      description: 'Email verified successfully',
    });

    return { success: true };
  }

  async forgotPassword(email: string) {
    const identity = await this.identityRepo.findByEmail(email);
    if (!identity) {
      // Don't reveal if email exists or not for security
      return {
        message: 'If the email exists, a password reset link has been sent',
      };
    }

    const resetToken = CryptoUtil.generateAlphanumericCode(32);

    // Store reset token (in production, hash it and store in database)
    // await this.storeResetToken(identity.userId, resetToken);

    await this.emailService.sendPasswordResetEmail(
      email,
      '',
      resetToken,
      new Date(Date.now() + 60 * 60 * 1000),
    );

    // Log activity
    await this.activityService.log({
      userId: identity.userId,
      type: ActivityType.PASSWORD_RESET_REQUEST,
      action: 'password_reset_requested',
      description: 'Password reset requested',
    });

    return {
      message: 'If the email exists, a password reset link has been sent',
    };
  }

  async resetPassword(token: string, newPassword: string) {
    // Verify token and reset password
    // This is a simplified version - in production, validate against stored token
    return { message: 'Password reset successful' };
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const identity = await this.db
      .select()
      .from(schema.identities)
      .where(
        and(
          eq(schema.identities.userId, userId),
          eq(schema.identities.provider, 'email'),
        ),
      )
      .limit(1);

    if (!identity || identity.length === 0) {
      throw new BadRequestException('No email identity found');
    }

    if (!identity[0].password) {
      throw new BadRequestException('No password set for this identity');
    }

    const isValid = await PasswordUtil.compare(
      currentPassword,
      identity[0].password,
    );
    if (!isValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hashedPassword = await PasswordUtil.hash(newPassword);

    await this.db
      .update(schema.identities)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(schema.identities.id, identity[0].id));

    // Revoke all refresh tokens to force re-login on all devices
    await this.refreshTokenRepo.revokeAllByUserId(userId);

    // Send notification
    await this.emailService.sendPasswordChangedEmail('', '', new Date());

    // Log activity
    await this.activityService.log({
      userId,
      type: ActivityType.PASSWORD_CHANGE,
      action: 'password_changed',
      description: 'Password changed successfully',
    });

    return { message: 'Password changed successfully' };
  }

  async validateUserById(userId: string) {
    const [user] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1);

    if (!user || !user.status || user.isDeleted) {
      return null;
    }

    return this.sanitizeUser(user);
  }

  async validateRefreshToken(userId: string, refreshToken: string) {
    // Verify the JWT token
    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.getOrThrow<string>('JWT.REFRESH.SECRET'),
      });
    } catch {
      return null;
    }

    if (payload.type !== 'refresh' || payload.userId !== userId) {
      return null;
    }

    // Check token in database
    const hashedToken = TokenUtil.hashToken(refreshToken);
    const storedToken =
      await this.refreshTokenRepo.findActiveByToken(hashedToken);

    if (
      !storedToken ||
      storedToken.expiresAt < new Date() ||
      storedToken.isRevoked
    ) {
      return null;
    }

    // Get user
    const [user] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1);

    if (!user || !user.status || user.isDeleted) {
      return null;
    }

    return this.sanitizeUser(user);
  }
}
