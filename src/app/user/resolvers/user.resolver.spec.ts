import { TestingModule } from "@nestjs/testing";

import { UserResolver } from "~/app/user/resolvers/user.resolver";
import { UserModule } from "~/app/user/user.module";
import { Permission } from "~/app/user/entities/permission.entity";
import { Role } from "~/app/user/entities/role.entity";
import { EmailConfirmationToken } from "~/app/account/entities/email_confirmation.entity";
import { ForgotPasswordToken } from "~/app/account/entities/forgot_password.entity";
import { User } from "~/app/user/entities/user.entity";
import { UserRepo } from "~/app/user/repositories/repositories/user.repository";
import { createTestingModule } from "~test/app_testing.module";
import { userGenerator } from "~test/generators/user.generator";

describe("register resolver", () => {
  const entities = [User, Role, Permission, ForgotPasswordToken, EmailConfirmationToken];

  let moduleRef: TestingModule;
  let userRepository: UserRepo;

  beforeAll(async () => {
    moduleRef = await createTestingModule(
      {
        imports: [UserModule],
      },
      entities,
    );
    userRepository = moduleRef.get<UserRepo>(UserRepo);
  });

  describe("user", () => {
    test("resolve user by id", async () => {
      // arrange
      const resolver = moduleRef.get<UserResolver>(UserResolver);
      const user = await userGenerator();
      await userRepository.save(user);

      // act
      const result = await resolver.user(user.email);

      // assert
      expect(result.id).toBe(user.id);
      expect(result.email).toBe(user.email);
      expect(result.firstName).toBe(user.firstName);
    });
  });

  describe("users", () => {
    test("resolve list users", async () => {
      // arrange
      const resolver = moduleRef.get<UserResolver>(UserResolver);
      await userRepository.save(await userGenerator());
      await userRepository.save(await userGenerator());
      await userRepository.save(await userGenerator());

      // act
      const result = await resolver.users({ limit: 2 });

      // assert
      expect(result.cursor.beforeCursor).toBeNull();
      expect(result.cursor.afterCursor).toBeTruthy();
      expect(result.data.length).toBe(2);
    });
  });
});
