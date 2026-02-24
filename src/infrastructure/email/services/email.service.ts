/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bullmq';
import { QUEUES } from '../../../core/queue/queues.constant';

export interface EmailTemplate {
  to: string;
  subject: string;
  template: string;
  context?: Record<string, any>;
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: Buffer;
  }>;
  priority?: number;
  delay?: number;
}

export enum EmailTemplateType {
  WELCOME = 'welcome',
  EMAIL_VERIFICATION = 'email-verification',
  PASSWORD_RESET = 'password-reset',
  PASSWORD_CHANGED = 'password-changed',
  EMAIL_VERIFIED = 'email-verified',
  ROLE_ASSIGNED = 'role-assigned',
  ACCOUNT_SUSPENDED = 'account-suspended',
  ACCOUNT_DELETED = 'account-deleted',
  LOGIN_ALERT = 'login-alert',
  SESSION_TERMINATED = 'session-terminated',
}

@Injectable()
export class EmailService {
  constructor(
    @InjectQueue(QUEUES.EMAIL) private readonly emailQueue: Queue,
    private readonly config: ConfigService,
  ) {}

  async sendEmail(options: EmailTemplate): Promise<void> {
    await this.emailQueue.add('send-email', options, {
      priority: options.priority || 5,
      delay: options.delay || 0,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
  }

  async sendWelcomeEmail(to: string, userName: string): Promise<void> {
    return this.sendEmail({
      to,
      subject: 'Welcome to Auth2X Ultra!',
      template: EmailTemplateType.WELCOME,
      context: {
        userName,
        appName: this.config.get('app.name', 'Auth2X Ultra'),
        appUrl: this.config.get('app.url', 'http://localhost:3000'),
      },
      priority: 3,
    });
  }

  async sendEmailVerificationEmail(
    to: string,
    userName: string,
    verificationCode: string,
    expiresAt: Date,
  ): Promise<void> {
    return this.sendEmail({
      to,
      subject: 'Verify Your Email Address',
      template: EmailTemplateType.EMAIL_VERIFICATION,
      context: {
        userName,
        verificationCode,
        expiresAt: expiresAt.toISOString(),
        appName: this.config.get('app.name', 'Auth2X Ultra'),
      },
      priority: 1, // High priority
    });
  }

  async sendEmailVerifiedEmail(to: string, userName: string): Promise<void> {
    return this.sendEmail({
      to,
      subject: 'Email Verified Successfully',
      template: EmailTemplateType.EMAIL_VERIFIED,
      context: {
        userName,
        appName: this.config.get('app.name', 'Auth2X Ultra'),
        appUrl: this.config.get('app.url', 'http://localhost:3000'),
      },
      priority: 3,
    });
  }

  async sendPasswordResetEmail(
    to: string,
    userName: string,
    resetToken: string,
    expiresAt: Date,
  ): Promise<void> {
    return this.sendEmail({
      to,
      subject: 'Reset Your Password',
      template: EmailTemplateType.PASSWORD_RESET,
      context: {
        userName,
        resetToken,
        expiresAt: expiresAt.toISOString(),
        appName: this.config.get('app.name', 'Auth2X Ultra'),
        appUrl: this.config.get('app.url', 'http://localhost:3000'),
      },
      priority: 1, // High priority
    });
  }

  async sendPasswordChangedEmail(
    to: string,
    userName: string,
    changedAt: Date,
  ): Promise<void> {
    return this.sendEmail({
      to,
      subject: 'Your Password Has Been Changed',
      template: EmailTemplateType.PASSWORD_CHANGED,
      context: {
        userName,
        changedAt: changedAt.toISOString(),
        appName: this.config.get('app.name', 'Auth2X Ultra'),
      },
      priority: 2,
    });
  }

  async sendRoleAssignedEmail(
    to: string,
    userName: string,
    roleName: string,
    assignedBy: string,
  ): Promise<void> {
    return this.sendEmail({
      to,
      subject: `Role Assigned: ${roleName}`,
      template: EmailTemplateType.ROLE_ASSIGNED,
      context: {
        userName,
        roleName,
        assignedBy,
        appName: this.config.get('app.name', 'Auth2X Ultra'),
      },
      priority: 4,
    });
  }

  async sendAccountSuspendedEmail(
    to: string,
    userName: string,
    reason?: string,
  ): Promise<void> {
    return this.sendEmail({
      to,
      subject: 'Your Account Has Been Suspended',
      template: EmailTemplateType.ACCOUNT_SUSPENDED,
      context: {
        userName,
        reason: reason || 'Violation of our terms of service',
        appName: this.config.get('app.name', 'Auth2X Ultra'),
      },
      priority: 2,
    });
  }

  async sendAccountDeletedEmail(to: string, userName: string): Promise<void> {
    return this.sendEmail({
      to,
      subject: 'Your Account Has Been Deleted',
      template: EmailTemplateType.ACCOUNT_DELETED,
      context: {
        userName,
        appName: this.config.get('app.name', 'Auth2X Ultra'),
      },
      priority: 3,
    });
  }

  async sendLoginAlertEmail(
    to: string,
    userName: string,
    loginDetails: {
      ipAddress: string;
      location?: string;
      device: string;
      time: Date;
    },
  ): Promise<void> {
    return this.sendEmail({
      to,
      subject: 'New Login Detected',
      template: EmailTemplateType.LOGIN_ALERT,
      context: {
        userName,
        ...loginDetails,
        time: loginDetails.time.toISOString(),
        appName: this.config.get('app.name', 'Auth2X Ultra'),
      },
      priority: 3,
    });
  }

  async sendSessionTerminatedEmail(
    to: string,
    userName: string,
    sessionDetails: {
      device: string;
      time: Date;
    },
  ): Promise<void> {
    return this.sendEmail({
      to,
      subject: 'Session Terminated',
      template: EmailTemplateType.SESSION_TERMINATED,
      context: {
        userName,
        ...sessionDetails,
        time: sessionDetails.time.toISOString(),
        appName: this.config.get('app.name', 'Auth2X Ultra'),
      },
      priority: 4,
    });
  }

  /**
   * Send bulk emails to multiple recipients
   */
  async sendBulkEmail(
    recipients: string[],
    template: EmailTemplateType,
    context: Record<string, any>,
  ): Promise<void> {
    const jobs = recipients.map((to) =>
      this.sendEmail({
        to,
        subject: context.subject || 'Notification',
        template,
        context: {
          ...context,
          email: to,
        },
      }),
    );

    await Promise.all(jobs);
  }

  /**
   * Check email queue status
   */
  async getQueueStats() {
    const waiting = await this.emailQueue.getWaitingCount();
    const active = await this.emailQueue.getActiveCount();
    const completed = await this.emailQueue.getCompletedCount();
    const failed = await this.emailQueue.getFailedCount();

    return {
      waiting,
      active,
      completed,
      failed,
    };
  }
}
