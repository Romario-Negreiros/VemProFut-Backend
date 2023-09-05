import type User from "../../models/user.model";

type KeysToPickFromUser = "name" | "password" | "isActive" | "verifyEmailToken" | "verifyEmailTokenExpiration";

export interface IUserServices {
  get: (email: string) => Promise<User | undefined>;
  create: (
    name: string,
    email: string,
    password: string,
    verifyEmailToken: string,
    verifyEmailTokenExpiration: string,
    teams?: number[],
  ) => Promise<void>;
  update: (
    email: string,
    columnsToUpdate: Pick<User, KeysToPickFromUser>,
    columnsInWhereClause: {
      id?: number,
      email?: string,
    },
    whereComparision?: "and" | "or",
    userTeams?: {
      removeAll: boolean;
      teamsToRemove: number[];
      teamsToAdd: number[];
    },
  ) => Promise<void>;
  verifyEmail: (email: string, token: string) => Promise<void>;
  updateTeams: (teams: string, user: User) => Promise<void>;
  delete: (email: string) => Promise<void>;
}
