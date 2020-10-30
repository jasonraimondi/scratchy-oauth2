import { ISendMailOptions } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";

import { EmailConfirmationToken } from "~/entity/user/email_confirmation.entity";
import { EmailService } from "~/lib/emails/services/email.service";
import { API_ROUTES } from "~/lib/routes/route.service";

interface IEmailService {
  send(context: any): Promise<void>;
}

@Injectable()
export class RegisterEmail implements IEmailService {
  constructor(private readonly emailService: EmailService) {}

  async send(userConfirmation: EmailConfirmationToken): Promise<void> {
    const user = userConfirmation.user;
    const data: ISendMailOptions = {
      to: user.email,
      subject: "Register User Email",
      template: "auth/register",
      context: {
        user,
        url: API_ROUTES.verify_email.create({
          email: user.email,
          id: userConfirmation.id,
        }),
      },
    };
    await this.emailService.send(data);
  }
}
