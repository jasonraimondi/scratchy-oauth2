import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bull";
import { MailerModule } from "@nestjs-modules/mailer";

import { QUEUE } from "~/lib/config/keys";
import { ENV } from "~/lib/config/environment";
import { emailProviders } from "~/lib/emails/email.providers";
import { SendEmailProcessor } from "~/lib/emails/processors/send_email.processor";
import { EmailService } from "~/lib/emails/services/email.service";
import { EmailTemplateService } from "~/lib/emails/services/email_template.service";
import { RepositoryModule } from "~/lib/repositories/repository.module";
import { QueueUIProvider } from "~/app/queue_ui.provider";

@Module({
  imports: [
    RepositoryModule,
    MailerModule.forRoot({
      transport: ENV.mailerURL,
      defaults: {
        from: `"graphql-scratchy" <jason+scratchy@raimondi.us>`,
      },
    }),
    BullModule.registerQueue({
      name: QUEUE.email,
      redis: ENV.queueURL,
    }),
  ],
  providers: [EmailService, EmailTemplateService, SendEmailProcessor, QueueUIProvider, ...emailProviders],
  exports: [...emailProviders],
})
export class EmailModule {}
