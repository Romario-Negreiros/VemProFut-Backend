import type User from "../../models/user.model";

type TGetOne = (email: string) => Promise<any | undefined>;

type TRegister = (
  name: string,
  email: string,
  teams: string,
  verifyEmailToken: string,
  verifyEmailTokenExpiration: string,
) => Promise<void>;

type TVerifyEmail = (email: string, token: string) => Promise<void>;

type TUpdateTeams = (teams: string, user: User) => Promise<void>;

type TDelete = (user: User) => Promise<void>;

export interface IUserServices {
  getOne: TGetOne;
  register: TRegister;
  verifyEmail: TVerifyEmail;
  updateTeams: TUpdateTeams;
  delete: TDelete;
}
