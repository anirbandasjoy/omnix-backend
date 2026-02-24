/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRepository } from '../repositories/user.repository';
import { IdentityRepository } from '../repositories/identity.repository';
import { ProfileRepository } from '../repositories/profile.repository';
import { UserSelect, ProfileSelect, IdentitySelect } from '../dto/user.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly identityRepo: IdentityRepository,
    private readonly profileRepo: ProfileRepository,
    private readonly config: ConfigService,
  ) {}

  async findById(id: string): Promise<UserSelect | null> {
    return this.userRepo.findOne(id);
  }

  async findByEmail(
    email: string,
  ): Promise<
    (UserSelect & { profile?: ProfileSelect; identity?: IdentitySelect }) | null
  > {
    const identity = await this.identityRepo.findByEmail(email);
    if (!identity) return null;

    const user = await this.userRepo.findOne(identity.userId);
    if (!user) return null;

    const profile = await this.profileRepo.findByUserId(user.id);

    return {
      ...user,
      profile,
      identity,
    };
  }

  async getProfile(userId: string): Promise<ProfileSelect | null> {
    return this.profileRepo.findByUserId(userId);
  }

  async updateProfile(
    userId: string,
    data: Partial<any>,
  ): Promise<ProfileSelect> {
    const profile = await this.profileRepo.findByUserId(userId);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return this.profileRepo.update(profile.id, data);
  }

  async deactivateUser(userId: string): Promise<void> {
    const user = await this.userRepo.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepo.update(userId, { status: false });
  }

  async changeEmail(
    userId: string,
    newEmail: string,
    password: string,
  ): Promise<void> {
    const identities = await this.identityRepo.findByUserId(userId);
    if (!identities || identities.length === 0) {
      throw new NotFoundException('Identity not found');
    }

    // Find the primary email identity
    const identity =
      identities.find((i) => i.provider === 'email' && i.isPrimary) ||
      identities[0];

    // Verify password first
    const isValid = await this.identityRepo.verifyPassword(
      identity.id,
      password,
    );
    if (!isValid) {
      throw new ConflictException('Invalid password');
    }

    // Check if new email already exists
    const existingIdentity = await this.identityRepo.findByEmail(newEmail);
    if (existingIdentity) {
      throw new ConflictException('Email already in use');
    }

    await this.identityRepo.update(identity.id, {
      providerId: newEmail,
      isVerified: false,
    });
  }

  async getUserWithRoles(userId: string): Promise<any> {
    const user = await this.userRepo.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const profile = await this.profileRepo.findByUserId(userId);

    return {
      ...user,
      profile,
    };
  }

  /**
   * Get paginated users with filtering and sorting
   */
  async getPaginatedUsers(options: {
    page: number;
    limit: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{
    data: UserSelect[];
    total: number;
  }> {
    const { page, limit, search, sortBy, sortOrder } = options;
    const skip = (page - 1) * limit;

    return this.userRepo.findPaginated(skip, limit, search, sortBy, sortOrder);
  }

  /**
   * Update user
   */
  async update(userId: string, data: Partial<any>): Promise<UserSelect> {
    const user = await this.userRepo.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.userRepo.update(userId, data);
  }

  /**
   * Terminate user (soft delete)
   */
  async terminateUser(userId: string): Promise<void> {
    const user = await this.userRepo.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepo.update(userId, {
      isDeleted: true,
      deletedAt: new Date(),
      status: false,
    });
  }
}
