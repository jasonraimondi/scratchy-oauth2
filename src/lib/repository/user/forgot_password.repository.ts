import { EntityRepository, Repository } from "typeorm";

import { IBaseRepository } from "~/lib/repository/base_repository";
import { ForgotPasswordToken } from "~/entity/user/forgot_password_entity";

export interface IForgotPasswordRepository
  extends IBaseRepository<ForgotPasswordToken> {
  findForUser(userId: string): Promise<ForgotPasswordToken>;
}

@EntityRepository(ForgotPasswordToken)
export class ForgotPasswordRepository extends Repository<ForgotPasswordToken>
  implements IForgotPasswordRepository {
  findById(id: string): Promise<ForgotPasswordToken> {
    return this.findOneOrFail(id, {
      join: {
        alias: "forgot_password_token",
        leftJoinAndSelect: {
          user: "forgot_password_token.user",
        },
      },
    });
  }

  findForUser(userId: string): Promise<ForgotPasswordToken> {
    return this.findOneOrFail({
      where: {
        user: userId,
      },
      join: {
        alias: "forgot_password_token",
        leftJoinAndSelect: {
          user: "forgot_password_token.user",
        },
      },
    });
  }
}