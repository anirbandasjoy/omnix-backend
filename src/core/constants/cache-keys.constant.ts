export const CacheKeys = {
  USER: (id: string) => `user:${id}`,
  USER_IDENTITIES: (userId: string) => `user:${userId}:identities`,
  USER_PROFILE: (userId: string) => `user:${userId}:profile`,
  USER_ROLES: (userId: string) => `user:${userId}:roles`,
  USER_PERMISSIONS: (userId: string) => `user:${userId}:permissions`,
  SESSION: (id: string) => `session:${id}`,
  REFRESH_TOKEN: (id: string) => `refresh_token:${id}`,
  DEVICE: (id: string) => `device:${id}`,
  ROLE: (id: string) => `role:${id}`,
  PERMISSION: (id: string) => `permission:${id}`,
} as const;
