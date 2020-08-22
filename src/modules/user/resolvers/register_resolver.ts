import { Arg, Mutation, Resolver } from "type-graphql";
import { hash } from "bcryptjs";
import { Inject } from "@nestjs/common";

import { RegisterResponse } from "~/modules/user/dtos/register_response";
import { User } from "~/entity/user/user_entity";
import { RegisterInput } from "~/modules/user/dtos/register_input";
import { REPOSITORY, SERVICE } from "~/lib/constants/inversify";
import { EmailConfirmationToken } from "~/entity/user/email_confirmation_entity";
import { IEmailConfirmationRepository } from "~/lib/repository/user/email_confirmation.repository";
import { IUserRepository } from "~/lib/repository/user/user.repository";
import { RegisterEmail } from "~/modules/user/emails/register.email";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";

@Resolver()
export class RegisterResolver {
  constructor(
    @Inject(REPOSITORY.UserRepository) private userRepository: IUserRepository,
    @Inject(REPOSITORY.EmailConfirmationRepository)
    private emailConfirmationRepository: IEmailConfirmationRepository,
    private registerEmail: RegisterEmail,
    @InjectQueue("audio") private readonly audioQueue: Queue,
  ) {}

  @Mutation(() => Boolean!)
  async resentConfirmEmail(@Arg("email") email: string): Promise<boolean> {
    const emailConfirmation = await this.emailConfirmationRepository.findByEmail(
      email,
    );
    try {
      await this.registerEmail.send(emailConfirmation);
      return true;
    } catch (e) {
      console.error(e);
    }
    return false;
  }

  @Mutation(() => RegisterResponse!)
  async register(
    @Arg("data") registerInput: RegisterInput,
  ): Promise<RegisterResponse> {
    registerInput.email = registerInput.email.toLowerCase();

    await this.audioQueue.add('transcode', registerInput);
    const { email, id, password } = registerInput;
    await this.guardAgainstDuplicateUser(email, id);
    const user = await User.create(registerInput);
    if (password) await user.setPassword(password)
    try {
      await this.userRepository.save(user);
      const emailConfirmation = new EmailConfirmationToken(user);
      await this.emailConfirmationRepository.save(emailConfirmation);
      await this.registerEmail.send(emailConfirmation);
      return { user, emailConfirmation };
    } catch (e) {
      console.error(e);
    }
    return {};
  }

  private async guardAgainstDuplicateUser(email: string, id?: string) {
    const falsy = () => false;
    if (id && (await this.userRepository.findById(id).catch(falsy))) {
      throw new Error("duplicate id for user");
    }
    if (await this.userRepository.findByEmail(email).catch(falsy)) {
      throw new Error("duplicate email for user");
    }
  }
}