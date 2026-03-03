import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { eq, and, sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { avatars, profiles } from '../../../database/schemas';
import { CloudinaryService } from '../../../infrastructure/storage';
import { InjectDatabase } from '../../../core/database';

interface UploadAvatarOptions {
  userId: string;
  file: Buffer;
  originalName: string;
  mimeType: string;
  fileSize: number;
  width?: number;
  height?: number;
  isPrimary?: boolean;
}

@Injectable()
export class MediaService {
  constructor(
    @InjectDatabase() private readonly db: NodePgDatabase<any>,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async uploadAvatar(options: UploadAvatarOptions) {
    const { userId, file, originalName, mimeType, fileSize, isPrimary } =
      options;

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
    ];
    if (!allowedTypes.includes(mimeType)) {
      throw new BadRequestException(
        'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.',
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (fileSize > maxSize) {
      throw new BadRequestException('File size exceeds 5MB limit');
    }

    // Get user info for folder naming
    const [user] = await this.db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1);

    // Upload to Cloudinary
    const uploadResult = await this.cloudinary.uploadFile(file, {
      folder: `avatars/${userId}`,
      publicId: `${userId}_${Date.now()}`,
      resourceType: 'image',
      transformation: [
        { quality: 'auto', fetchFormat: 'auto' },
        { width: 500, height: 500, crop: 'limit' },
      ],
    });

    // Store avatar record in database
    const [avatar] = await this.db
      .insert(avatars)
      .values({
        userId,
        originalName,
        fileName: uploadResult.publicId,
        filePath: uploadResult.publicId,
        fileSize: String(fileSize),
        mimeType,
        width: String(uploadResult.width),
        height: String(uploadResult.height),
        cdnUrl: uploadResult.secureUrl,
        isActive: true,
      })
      .returning();

    // Set as profile avatar if requested or if user has no avatar
    if (isPrimary || !user?.avatarId) {
      await this.db
        .update(profiles)
        .set({ avatarId: avatar.id, updatedAt: new Date() })
        .where(eq(profiles.userId, userId));
    }

    return {
      id: avatar.id,
      url: uploadResult.secureUrl,
      thumbnailUrl: this.cloudinary.getThumbnailUrl(
        uploadResult.publicId,
        200,
        200,
      ),
      isPrimary: true,
    };
  }

  async getUserAvatars(userId: string) {
    const result = await this.db
      .select()
      .from(avatars)
      .where(and(eq(avatars.userId, userId), eq(avatars.isActive, true)))
      .orderBy(avatars.createdAt);

    return result.map((avatar) => ({
      id: avatar.id,
      url: avatar.cdnUrl,
      thumbnailUrl: this.cloudinary.getThumbnailUrl(avatar.fileName, 200, 200),
      isActive: avatar.isActive,
      createdAt: avatar.createdAt,
    }));
  }

  async getAvatar(avatarId: string) {
    const [avatar] = await this.db
      .select()
      .from(avatars)
      .where(eq(avatars.id, avatarId))
      .limit(1);

    if (!avatar) {
      throw new NotFoundException('Avatar not found');
    }

    // Check if this avatar is set as profile avatar
    const [profile] = await this.db
      .select()
      .from(profiles)
      .where(eq(profiles.avatarId, avatarId))
      .limit(1);

    return {
      id: avatar.id,
      url: avatar.cdnUrl || '',
      thumbnailUrl: this.cloudinary.getThumbnailUrl(avatar.fileName, 200, 200),
      isActive: avatar.isActive,
      isPrimary: !!profile,
      originalName: avatar.originalName,
      fileSize: Number(avatar.fileSize) || 0,
      mimeType: avatar.mimeType,
      width: avatar.width ? Number(avatar.width) : undefined,
      height: avatar.height ? Number(avatar.height) : undefined,
      createdAt: avatar.createdAt,
    };
  }

  async setAsProfileAvatar(userId: string, avatarId: string) {
    // Verify avatar belongs to user
    const [avatar] = await this.db
      .select()
      .from(avatars)
      .where(and(eq(avatars.id, avatarId), eq(avatars.userId, userId)))
      .limit(1);

    if (!avatar) {
      throw new NotFoundException(
        'Avatar not found or does not belong to user',
      );
    }

    // Update profile
    await this.db
      .update(profiles)
      .set({ avatarId, updatedAt: new Date() })
      .where(eq(profiles.userId, userId));

    return { message: 'Profile avatar updated successfully' };
  }

  async deleteAvatar(userId: string, avatarId: string) {
    // Verify avatar belongs to user
    const [avatar] = await this.db
      .select()
      .from(avatars)
      .where(and(eq(avatars.id, avatarId), eq(avatars.userId, userId)))
      .limit(1);

    if (!avatar) {
      throw new NotFoundException(
        'Avatar not found or does not belong to user',
      );
    }

    // Check if it's the current profile avatar
    const [profile] = await this.db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1);

    if (profile?.avatarId === avatarId) {
      throw new BadRequestException('Cannot delete current profile avatar');
    }

    // Soft delete from database
    await this.db
      .update(avatars)
      .set({
        isActive: false,
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(avatars.id, avatarId));

    // Optionally delete from Cloudinary
    // await this.cloudinary.deleteFile(avatar.fileName);

    return { message: 'Avatar deleted successfully' };
  }

  async updateAvatarMetadata(
    avatarId: string,
    userId: string,
    metadata: { altText?: string; title?: string },
  ) {
    // Verify ownership
    const [avatar] = await this.db
      .select()
      .from(avatars)
      .where(and(eq(avatars.id, avatarId), eq(avatars.userId, userId)))
      .limit(1);

    if (!avatar) {
      throw new NotFoundException(
        'Avatar not found or does not belong to user',
      );
    }

    const result = await this.db
      .update(avatars)
      .set({
        ...metadata,
        updatedAt: new Date(),
      })
      .where(eq(avatars.id, avatarId))
      .returning();

    return result[0];
  }

  async cleanupOrphanAvatars() {
    // Find avatars that are not linked to any profile and are older than 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const orphanedAvatars = await this.db
      .select({
        id: avatars.id,
        fileName: avatars.fileName,
      })
      .from(avatars)
      .leftJoin(profiles, eq(profiles.avatarId, avatars.id))
      .where(
        and(
          eq(avatars.isActive, true),
          sql`${profiles.id} IS NULL`,
          sql`${avatars.createdAt} < ${thirtyDaysAgo}`,
        ),
      );

    // Soft delete orphaned avatars
    for (const avatar of orphanedAvatars) {
      await this.db
        .update(avatars)
        .set({
          isActive: false,
          deletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(avatars.id, avatar.id));
    }

    return { cleaned: orphanedAvatars.length };
  }

  async getAvatarStats() {
    const [total] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(avatars);
    const [active] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(avatars)
      .where(eq(avatars.isActive, true));

    const [totalSize] = await this.db
      .select({
        total: sql<number>`sum(CASE WHEN ${avatars.isActive} THEN 1 ELSE 0 END)::int`,
      })
      .from(avatars);

    return {
      total,
      active,
      totalSize: totalSize.total || 0,
    };
  }

  /**
   * Get media statistics (alias for getAvatarStats)
   */
  async getStatistics() {
    const stats = await this.getAvatarStats();
    return {
      total: stats.total.count,
      active: stats.active.count,
      totalSize: stats.totalSize,
    };
  }
}
