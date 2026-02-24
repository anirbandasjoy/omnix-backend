import { Injectable } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { identities } from '../../../database/schema';
import { BaseRepository, InjectDatabase } from '../../../core/database';
import { IdentityProvider } from '../../../core/enums';
import { PasswordUtil } from '../../../core/utils';

@Injectable()
export class IdentityRepository extends BaseRepository<any, typeof identities> {
  constructor(@InjectDatabase() db: NodePgDatabase<any>) {
    super(db, identities);
  }

  async findByUserId(userId: string) {
    const result = await this.db
      .select()
      .from(identities)
      .where(eq(identities.userId, userId));
    return result;
  }

  async findByProviderAndProviderId(
    provider: IdentityProvider | string,
    providerId: string,
  ) {
    return this.findOneByCondition({
      provider,
      providerId,
    }) as Promise<typeof identities.$inferSelect | null>;
  }

  async findByEmail(email: string) {
    return this.findOneByCondition({
      provider: IdentityProvider.EMAIL,
      providerId: email,
    }) as Promise<typeof identities.$inferSelect | null>;
  }

  async findByPhone(phone: string) {
    return this.findOneByCondition({
      provider: IdentityProvider.PHONE,
      providerId: phone,
    }) as Promise<typeof identities.$inferSelect | null>;
  }

  async findByUsername(username: string) {
    return this.findOneByCondition({
      provider: IdentityProvider.USERNAME,
      providerId: username,
    }) as Promise<typeof identities.$inferSelect | null>;
  }

  async findPrimaryByUserId(userId: string) {
    const result = await this.db
      .select()
      .from(identities)
      .where(and(eq(identities.userId, userId), eq(identities.isPrimary, true)))
      .limit(1);
    return result[0] || null;
  }

  async findVerifiedByUserId(userId: string) {
    const result = await this.db
      .select()
      .from(identities)
      .where(
        and(eq(identities.userId, userId), eq(identities.isVerified, true)),
      );
    return result;
  }

  async setPrimary(id: string, userId: string) {
    // First, remove primary from all identities of this user
    await this.db
      .update(identities)
      .set({ isPrimary: false })
      .where(
        and(eq(identities.userId, userId), eq(identities.isPrimary, true)),
      );

    // Then, set this identity as primary
    const result = await this.db
      .update(identities)
      .set({ isPrimary: true })
      .where(eq(identities.id, id))
      .returning();
    return result[0];
  }

  async updateVerification(id: string, isVerified: boolean) {
    const result = await this.db
      .update(identities)
      .set({ isVerified })
      .where(eq(identities.id, id))
      .returning();
    return result[0];
  }

  async verifyPassword(id: string, password: string): Promise<boolean> {
    const [identity] = await this.db
      .select()
      .from(identities)
      .where(eq(identities.id, id))
      .limit(1);

    if (!identity || !identity.password) {
      return false;
    }

    return PasswordUtil.compare(password, identity.password);
  }

  async existsByEmail(email: string) {
    return this.exists({ provider: IdentityProvider.EMAIL, providerId: email });
  }

  async existsByPhone(phone: string) {
    return this.exists({ provider: IdentityProvider.PHONE, providerId: phone });
  }

  async existsByUsername(username: string) {
    return this.exists({
      provider: IdentityProvider.USERNAME,
      providerId: username,
    });
  }
}
