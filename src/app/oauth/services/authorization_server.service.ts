import {
  AuthorizationServer as JmondiAuthorizationServer,
  DateInterval,
  OAuthException,
  AuthorizationServerOptions,
} from "@jmondi/oauth2-server";
import { CookieOptions, Response } from "express";
import { AuthCodeRepo } from "~/app/oauth/repositories/auth_code.repository";
import { ClientRepo } from "~/app/oauth/repositories/client.repository";
import { OAuthUserRepo } from "~/app/oauth/repositories/oauth_user.repository";
import { ScopeRepo } from "~/app/oauth/repositories/scope.repository";
import { TokenRepo } from "~/app/oauth/repositories/token.repository";
import { MyJwtService } from "~/app/oauth/services/jwt.service";
import { ENV } from "~/config/environment";

export class AuthorizationServer extends JmondiAuthorizationServer {
  handleError(e: any, res: Response) {
    if (e instanceof OAuthException) {
      res.status(e.status);
      res.send({
        status: e.status,
        message: e.message,
      });
      return;
    }
    throw e;
  }

  cookieOptions(cookieTTL?: DateInterval, extraParams?: Record<string, unknown>): CookieOptions {
    return {
      httpOnly: true,
      domain: ENV.domain,
      expires: cookieTTL?.getEndDate() ?? new Date(0),
      ...extraParams,
    };
  }

  static register(options?: AuthorizationServerOptions) {
    return {
      provide: AuthorizationServer,
      useFactory: (
        authCodeRepo: AuthCodeRepo,
        clientRepo: ClientRepo,
        tokenRepo: TokenRepo,
        scopeRepo: ScopeRepo,
        userRepo: OAuthUserRepo,
        jwt: MyJwtService,
      ) => new AuthorizationServer(authCodeRepo, clientRepo, tokenRepo, scopeRepo, userRepo, jwt, options),
      inject: [AuthCodeRepo, ClientRepo, TokenRepo, ScopeRepo, OAuthUserRepo, MyJwtService],
    };
  }
}