import { enumToArray } from '@/core/utils/enum.util';
import { pgEnum } from 'drizzle-orm/pg-core';

export enum AuditLogCategory {
  // Authentication & Authorization
  Authentication = 'authentication',
  Authorization = 'authorization',
  Session = 'session',

  // User Management
  User = 'user',
  Profile = 'profile',
  Account = 'account',

  // Data Operations
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',

  // File & Asset Management
  FileUpload = 'file_upload',
  FileDownload = 'file_download',
  FileDelete = 'file_delete',

  // System & Infrastructure
  System = 'system',
  Configuration = 'configuration',
  Deployment = 'deployment',

  // Security
  Security = 'security',
  Permission = 'permission',
  Role = 'role',

  // API & Requests
  API = 'api',
  Request = 'request',
  Response = 'response',

  // Database
  Database = 'database',
  Migration = 'migration',

  // Notifications & Communication
  Email = 'email',
  Notification = 'notification',
  SMS = 'sms',

  // Payments & Transactions
  Payment = 'payment',
  Transaction = 'transaction',
  Refund = 'refund',

  // Audit & Compliance
  Audit = 'audit',
  Compliance = 'compliance',

  // Errors & Exceptions
  Error = 'error',
  Exception = 'exception',

  // Performance & Monitoring
  Performance = 'performance',
  Monitoring = 'monitoring',

  // Third-party Integrations
  Integration = 'integration',
  Webhook = 'webhook',

  // Background Jobs
  Job = 'job',
  Queue = 'queue',
  Cron = 'cron',
}

export const AuditLogCategoryEnum = pgEnum(
  'audit_log_category_enum',
  enumToArray(AuditLogCategory),
);

export enum AuditLogSeverity {
  Emergency = 'emergency',
  Alert = 'alert',
  Critical = 'critical',
  Error = 'error',
  Warning = 'warning',
  Notice = 'notice',
  Info = 'info',
  Debug = 'debug',
}

export const AuditLogSeverityEnum = pgEnum(
  'audit_log_severity_enum',
  enumToArray(AuditLogSeverity),
);

export enum AuditLogAction {
  // Authentication Actions
  Login = 'login',
  Logout = 'logout',
  LoginFailed = 'login_failed',
  PasswordChange = 'password_change',
  PasswordReset = 'password_reset',
  TwoFactorEnabled = '2fa_enabled',
  TwoFactorDisabled = '2fa_disabled',

  // User Actions
  UserCreated = 'user_created',
  UserUpdated = 'user_updated',
  UserDeleted = 'user_deleted',
  UserSuspended = 'user_suspended',
  UserReactivated = 'user_reactivated',

  // Data Actions
  DataCreated = 'data_created',
  DataUpdated = 'data_updated',
  DataDeleted = 'data_deleted',
  DataViewed = 'data_viewed',
  DataExported = 'data_exported',
  DataImported = 'data_imported',

  // File Actions
  FileUploaded = 'file_uploaded',
  FileDownloaded = 'file_downloaded',
  FileDeleted = 'file_deleted',
  FileAccessed = 'file_accessed',

  // Permission Actions
  PermissionGranted = 'permission_granted',
  PermissionRevoked = 'permission_revoked',
  RoleAssigned = 'role_assigned',
  RoleRemoved = 'role_removed',

  // System Actions
  ConfigChanged = 'config_changed',
  SystemStarted = 'system_started',
  SystemStopped = 'system_stopped',
  BackupCreated = 'backup_created',
  BackupRestored = 'backup_restored',

  // Security Actions
  SecurityAlert = 'security_alert',
  BruteForceDetected = 'brute_force_detected',
  SuspiciousActivity = 'suspicious_activity',
  MalwareDetected = 'malware_detected',
  IntrusionDetected = 'intrusion_detected',

  // API Actions
  APICalled = 'api_called',
  WebhookReceived = 'webhook_received',
  WebhookSent = 'webhook_sent',
  WebhookFailed = 'webhook_failed',

  // Error Actions
  ErrorOccurred = 'error_occurred',
  ExceptionThrown = 'exception_thrown',
  CrashReported = 'crash_reported',

  // Job Actions
  JobStarted = 'job_started',
  JobCompleted = 'job_completed',
  JobFailed = 'job_failed',
  JobRetried = 'job_retried',
}

export const AuditLogActionEnum = pgEnum(
  'audit_log_action_enum',
  enumToArray(AuditLogAction),
);

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS',
  TRACE = 'TRACE',
  CONNECT = 'CONNECT',
}

export const HttpMethodEnum = pgEnum(
  'http_method_enum',
  enumToArray(HttpMethod),
);
