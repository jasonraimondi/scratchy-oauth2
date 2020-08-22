import { Request, Response } from "express";

export interface MyContext {
  req: Request | any;
  res: Response | any;
  auth?: {
    userId: string;
    email: string;
    isEmailConfirmed: boolean;
  };
}