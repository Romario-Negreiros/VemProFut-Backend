import type User from "../../models/user.model";

export interface IUserServices {
  get: (email: string) => Promise<User | undefined>;
  create: (
    name: string,
    email: string,
    password: string,
    verifyEmailToken: string,
    verifyEmailTokenExpiration: string,
    teams?: string,
  ) => Promise<void>;
  verifyEmail: (email: string, token: string) => Promise<void>;
  updateTeams: (teams: string, user: User) => Promise<void>;
  delete: (email: string) => Promise<void>;
}
