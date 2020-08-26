import { EntityRepository, Repository } from "typeorm";

import { EmailConfirmationToken } from "~/entity/user/email_confirmation_entity";
import { IBaseRepository } from "~/lib/repositories/base.repository";

export interface IEmailConfirmationRepository extends IBaseRepository<EmailConfirmationToken> {
  findByEmail(email: string): Promise<EmailConfirmationToken>;
}

@EntityRepository(EmailConfirmationToken)
export class EmailConfirmationRepository extends Repository<EmailConfirmationToken>
  implements IEmailConfirmationRepository {
  findByEmail(email: string): Promise<EmailConfirmationToken> {
    return this.findOneOrFail({
      join: {
        alias: "user_confirmation",
        leftJoinAndSelect: {
          user: "user_confirmation.user",
        },
      },
      where: {
        "user.email = :email": {
          email,
        },
      },
    });
  }

  findById(id: string): Promise<EmailConfirmationToken> {
    return this.findOneOrFail(id, {
      join: {
        alias: "user_confirmation",
        leftJoinAndSelect: {
          user: "user_confirmation.user",
        },
      },
    });
  }
}