import type User from "../../models/user.model";

type KeysToPickFromUser =
  | "name"
  | "password"
  | "isActive"
  | "verifyEmailToken"
  | "verifyEmailTokenExpiration"
  | "resetPasswordToken"
  | "resetPasswordTokenExpiration";

export interface IUserServices {
  get: (email: string, fields?: KeysToPickFromUser[]) => Promise<User | undefined>;
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
      id?: number;
      email?: string;
    },
    whereComparision?: "and" | "or",
    userTeams?: {
      removeAll: boolean;
      teamsToRemove: number[];
      teamsToAdd: number[];
    },
  ) => Promise<void>;
  delete: (email: string) => Promise<void>;
}
