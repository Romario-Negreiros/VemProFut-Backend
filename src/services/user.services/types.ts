import type UserModel from "../../models/user.model";
import type TeamModel from "../../models/team.model";
import type Venue from "../../models/venue.model";

type KeysToPickFromUser =
  | "name"
  | "password"
  | "isActive"
  | "verifyEmailToken"
  | "verifyEmailTokenExpiration"
  | "resetPasswordToken"
  | "resetPasswordTokenExpiration";

interface Team extends Omit<TeamModel, "venueId"> {
  venue: Venue | null;
}

interface User extends Omit<UserModel, "teams"> {
  teams: string | Team[] | null;
}

export interface IUserServices {
  get: (email: string, fields?: Array<Partial<KeysToPickFromUser>>) => Promise<User | undefined>;
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
    columnsToUpdate: Partial<Pick<User, KeysToPickFromUser>>,
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
