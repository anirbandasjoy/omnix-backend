import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { MailerService } from '@nestjs-modules/mailer';
import { QUEUES } from '../queues.constant';
import { EmailTemplate } from '../../../infrastructure/email/services/email.service';

export type EmailJobData = EmailTemplate;

@Processor(QUEUES.EMAIL)
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(private readonly mailerService: MailerService) {}

  @Process('send-email')
  async handleSendEmail(job: Job<EmailJobData>): Promise<void> {
    this.logger.debug(`Processing email job ${job.id} to ${job.data.to}`);

    const { to, subject, template, context, attachments } = job.data;

    try {
      // Render template and send email
      await this.mailerService.sendMail({
        to,
        subject,
        template: `./${template}`,
        context: {
          ...context,
          appName: 'Auth2X Ultra',
          appUrl: process.env.APP_URL || 'http://localhost:3000',
        },
        attachments,
      });

      this.logger.log(
        `Email sent successfully to ${to} for template: ${template}`,
      );
    } catch (error: unknown) {
      const err = error as { message?: string; stack?: string };
      this.logger.error(
        `Failed to send email to ${to} with template ${template}: ${err.message}`,
        err.stack,
      );
      throw error; // Will trigger retry
    }
  }
}
