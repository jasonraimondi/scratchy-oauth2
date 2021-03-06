import { TypeOrmModule } from "@nestjs/typeorm";
import { EntityClassOrSchema } from "@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type";
import { Test } from "@nestjs/testing";
import { ModuleMetadata } from "@nestjs/common/interfaces/modules/module-metadata.interface";
import { MailerService } from "@nestjs-modules/mailer";

import { Permission } from "~/app/user/entities/permission.entity";
import { Role } from "~/app/user/entities/role.entity";
import { EmailConfirmationToken } from "~/app/account/entities/email_confirmation.entity";
import { ForgotPasswordToken } from "~/app/account/entities/forgot_password.entity";
import { User } from "~/app/user/entities/user.entity";
import { EmailService } from "~/app/emails/services/email.service";
import { CustomNamingStrategy } from "~/app/database/naming";
import { DatabaseModule } from "~/app/database/database.module";
import { emails, emailServiceMock } from "./mock_email_service";

const mailerServiceMock = {
  sendMail: jest.fn().mockImplementation((res) => {
    emails.push(res);
  }),
};

const mockQueue = {
  add: jest.fn().mockImplementation(console.log),
};

const baseEntities = [User, Role, Permission, ForgotPasswordToken, EmailConfirmationToken];

export async function createTestingModule(
  metadata: ModuleMetadata,
  entities: EntityClassOrSchema[] = [],
  logging = false,
) {
  entities = [...baseEntities, ...entities];
  metadata = {
    ...metadata,
    imports: [
      TypeOrmModule.forRoot({
        retryAttempts: 0,
        type: "sqlite",
        database: ":memory:",
        logging,
        keepConnectionAlive: false,
        synchronize: entities.length > 0, // true since base entities exist, otherwise entities.length > 0
        namingStrategy: new CustomNamingStrategy(),
        entities,
      }),
      DatabaseModule,
      ...(metadata.imports ?? []),
    ],
    providers: [
      {
        provide: EmailService,
        useValue: emailServiceMock,
      },
      {
        provide: MailerService,
        useValue: mailerServiceMock,
      },
      ...(metadata.providers ?? []),
    ],
  };

  return Test.createTestingModule(metadata)
    .overrideProvider(EmailService)
    .useValue(emailServiceMock)
    .overrideProvider(MailerService)
    .useValue(mailerServiceMock)
    .overrideProvider("BullQueue_email")
    .useValue(mockQueue)
    .compile();
}
