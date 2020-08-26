import { EntityRepository, Repository } from "typeorm";

import { User } from "~/entity/user/user_entity";
import { IBaseRepository } from "~/lib/repositories/base.repository";

export interface IUserRepository extends IBaseRepository<User> {
  findByEmail(email: string): Promise<User>;

  incrementLastLogin(user: User, ipAddr: string): Promise<void>;

  incrementToken(id: string): Promise<void>;
}

@EntityRepository(User)
export class UserRepository extends Repository<User> implements IUserRepository {
  findById(id: string) {
    return this.findOneOrFail(id);
  }

  findByEmail(email: string) {
    email = email.toLowerCase();
    return this.findOneOrFail({ where: { email } });
  }

  async incrementLastLogin(user: User, ipAddr: string) {
    user.lastLoginAt = new Date();
    user.lastLoginIP = ipAddr;
    await this.save(user);
  }

  async incrementToken(userId: string) {
    await this.increment({ id: userId }, "tokenVersion", 1);
  }
}