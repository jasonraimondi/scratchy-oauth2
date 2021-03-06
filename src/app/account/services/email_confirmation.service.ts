import { Injectable } from "@nestjs/common";

import { LoggerService } from "~/app/logger/logger.service";
import { EmailConfirmationRepo } from "~/app/user/repositories/repositories/email_confirmation.repository";
import { UserRepo } from "~/app/user/repositories/repositories/user.repository";

@Injectable()
export class EmailConfirmationService {
  constructor(
    private userRepository: UserRepo,
    private userConfirmationRepository: EmailConfirmationRepo,
    private readonly logger: LoggerService,
  ) {
    logger.setContext(this.constructor.name);
  }

  async verifyEmailConfirmation(email: string, id: string): Promise<boolean> {
    email = email.toLowerCase();
    const userConfirmation = await this.userConfirmationRepository.findById(id);
    if (userConfirmation.user.email !== email) {
      throw new Error(`invalid user and confirmation (${userConfirmation.user.email}) (${email})`);
    }
    try {
      const { user } = userConfirmation;
      user.isEmailConfirmed = true;
      await this.userRepository.save(user);
      await this.userConfirmationRepository.delete(userConfirmation.id);
      return true;
    } catch (e) {
      this.logger.error(e);
    }
    return false;
  }
}
