import type User from "../../models/user.model";

type TUpdateTeams = (teams: string, user: User) => Promise<void>;

type TCreate = (
  name: string,
  email: string,
  password: string,
  verifyEmailToken: string,
  verifyEmailTokenExpiration: string,
  teams?: string,
) => Promise<void>;

type TVerifyEmail = (email: string, token: string) => Promise<void>;

type TDelete = (email: string) => Promise<void>;

export interface IUserServices {
  create: TCreate;
  verifyEmail: TVerifyEmail;
  updateTeams: TUpdateTeams;
  delete: TDelete;
}
