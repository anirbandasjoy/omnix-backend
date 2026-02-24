export const Events = {
  USER_REGISTERED: 'user.registered',
  USER_LOGIN: 'user.login',
  USER_LOGOUT: 'user.logout',
  USER_EMAIL_VERIFIED: 'user.email.verified',
  USER_PASSWORD_CHANGED: 'user.password.changed',
  USER_PASSWORD_RESET: 'user.password.reset',
  USER_ROLE_ASSIGNED: 'user.role.assigned',
  USER_ROLE_REVOKED: 'user.role.revoked',
  SESSION_CREATED: 'session.created',
  SESSION_TERMINATED: 'session.terminated',
  EMAIL_SENT: 'email.sent',
  EMAIL_FAILED: 'email.failed',
} as const;
