export enum ActivityType {
  // Authentication
  REGISTER = 'register',
  LOGIN = 'login',
  LOGOUT = 'logout',
  TOKEN_REFRESH = 'token_refresh',
  PASSWORD_CHANGE = 'password_change',
  PASSWORD_RESET_REQUEST = 'password_reset_request',
  PASSWORD_RESET_COMPLETE = 'password_reset_complete',

  // Verification
  EMAIL_VERIFICATION_SENT = 'email_verification_sent',
  EMAIL_VERIFIED = 'email_verified',
  PHONE_VERIFIED = 'phone_verified',

  // OAuth
  OAUTH_LINKED = 'oauth_linked',
  OAUTH_UNLINKED = 'oauth_unlinked',

  // User Management
  PROFILE_UPDATED = 'profile_updated',
  ACCOUNT_SUSPENDED = 'account_suspended',
  ACCOUNT_ACTIVATED = 'account_activated',
  ACCOUNT_SOFT_DELETED = 'account_soft_deleted',
  ACCOUNT_RECOVERED = 'account_recovered',
  ACCOUNT_TERMINATED = 'account_terminated',

  // RBAC
  ROLE_ASSIGNED = 'role_assigned',
  ROLE_REVOKED = 'role_revoked',
  PERMISSION_GRANTED = 'permission_granted',
  PERMISSION_REVOKED = 'permission_revoked',

  // Sessions & Devices
  SESSION_CREATED = 'session_created',
  SESSION_TERMINATED = 'session_terminated',
  DEVICE_TRUSTED = 'device_trusted',
  DEVICE_REVOKED = 'device_revoked',

  // Media
  AVATAR_UPLOADED = 'avatar_uploaded',
  AVATAR_UPDATED = 'avatar_updated',
  AVATAR_DELETED = 'avatar_deleted',

  // Admin
  USER_VIEWED = 'user_viewed',
  USER_MODIFIED = 'user_modified',
  BULK_ACTION = 'bulk_action',
}
