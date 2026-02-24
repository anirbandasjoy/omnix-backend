export const QUEUES = {
  EMAIL: 'email',
  ACTIVITY: 'activity',
  NOTIFICATION: 'notification',
} as const;

export const QUEUE_PROCESSORS = {
  EMAIL: 'email-processor',
  ACTIVITY: 'activity-processor',
  NOTIFICATION: 'notification-processor',
} as const;
