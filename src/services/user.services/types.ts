import type User from "../../models/user.model";

type TGetOne = (email: string) => Promise<User | undefined>;

type TSignUp = (
  verifyEmailToken: string,
  verifyEmailTokenExpiration: string,
  name: string,
  email: string,
  password: string,
  teams?: string,
) => Promise<void>;

type TVerifyEmail = (email: string, token: string) => Promise<void>;

type TUpdateTeams = (teams: string, user: User) => Promise<void>;

type TDelete = (user: User) => Promise<void>;

export interface IUserServices {
  getOne: TGetOne;
  signUp: TSignUp;
  verifyEmail: TVerifyEmail;
  updateTeams: TUpdateTeams;
  delete: TDelete;
}
