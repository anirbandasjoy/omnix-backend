export const Queues = {
  EMAIL: 'email-queue',
  ACTIVITY: 'activity-queue',
  NOTIFICATION: 'notification-queue',
} as const;

export const QueueJobs = {
  SEND_EMAIL: 'send-email',
  LOG_ACTIVITY: 'log-activity',
  SEND_NOTIFICATION: 'send-notification',
} as const;

export const EmailTemplates = {
  WELCOME: 'welcome',
  EMAIL_VERIFICATION: 'email-verification',
  PASSWORD_RESET: 'password-reset',
  PASSWORD_CHANGED: 'password-changed',
  ROLE_ASSIGNED: 'role-assigned',
  ACCOUNT_SUSPENDED: 'account-suspended',
  ACCOUNT_DELETED: 'account-deleted',
} as const;
