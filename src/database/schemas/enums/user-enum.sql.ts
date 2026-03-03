import { enumToArray } from '@/core/utils/enum.util';
import { pgEnum } from 'drizzle-orm/pg-core';

export enum Gender {
  Male = 'male',
  Female = 'female',
  Other = 'other',
  PreferNotToSay = 'prefer_not_to_say',
}

export const GenderEnum = pgEnum('gender_enum', enumToArray(Gender));

export enum UserAttributeType {
  String = 'string',
  Number = 'number',
  Boolean = 'boolean',
  Json = 'json',
}

export const UserAttributeTypeEnum = pgEnum(
  'user_attribute_type_enum',
  enumToArray(UserAttributeType),
);

export enum UserActivityType {
  // Registration & Account Setup
  Registration = 'registration',
  RegistrationConfirmation = 'registration_confirmation',
  EmailVerification = 'email_verification',
  PhoneVerification = 'phone_verification',

  // Auth
  Login = 'login',
  Logout = 'logout',
  LoginFailed = 'login_failed',
  SessionExpired = 'session_expired',
  SessionRevoked = 'session_revoked',

  // Password
  ResetPasswordRequest = 'reset_password_request',
  ResetPasswordConfirmation = 'reset_password_confirmation',
  PasswordChange = 'password_change',

  // Profile
  ProfileUpdate = 'profile_update',
  AvatarUpdate = 'avatar_update',
  EmailChange = 'email_change',
  PhoneChange = 'phone_change',

  // Security
  TwoFactorEnabled = 'two_factor_enabled',
  TwoFactorDisabled = 'two_factor_disabled',
  TwoFactorVerified = 'two_factor_verified',

  // Identity
  IdentityLinked = 'identity_linked',
  IdentityUnlinked = 'identity_unlinked',

  // Access Control
  AccountRevoked = 'account_revoked',
  AccountReactivated = 'account_reactivated',
  AccountDeleted = 'account_deleted',
  AccountRecovered = 'account_recovered',

  // Asset / Content
  AssetUploaded = 'asset_uploaded',
  AssetDeleted = 'asset_deleted',
  AssetRevoked = 'asset_revoked',

  // Activity Tracking
  NewDeviceLogin = 'new_device_login',
  LocationChangeDetected = 'location_change_detected',

  // Settings
  PreferencesUpdated = 'preferences_updated',

  // Admin Actions
  RoleUpdated = 'role_updated',
  PermissionUpdated = 'permission_updated',

  // Terms / Compliance
  TermsAccepted = 'terms_accepted',
  PrivacyPolicyAccepted = 'privacy_policy_accepted',
}
export const UserActivityTypeEnum = pgEnum(
  'user_activity_type_enum',
  enumToArray(UserActivityType),
);

export enum DeviceType {
  Desktop = 'desktop',
  Mobile = 'mobile',
  Tablet = 'tablet',
  Unknown = 'unknown',
}

export const DeviceTypeEnum = pgEnum(
  'device_type_enum',
  enumToArray(DeviceType),
);

export enum IdentityProvider {
  Email = 'email',
  Phone = 'phone',
  Username = 'username',
  Google = 'google',
  Github = 'github',
}

export const IdentityProviderEnum = pgEnum(
  'identity_provider_enum',
  enumToArray(IdentityProvider),
);

export enum UserRoleLevel {
  User = 'user',
  Moderator = 'moderator',
  Admin = 'admin',
  System = 'system',
}

export const UserRoleLevelEnum = pgEnum(
  'user_role_level_enum',
  enumToArray(UserRoleLevel),
);
