import type User from "../../models/user.model";
import type Team from "../../models/team.model";
import type Venue from "../../models/venue.model";

interface GetOneResponse extends Omit<User, "teams"> {
  teams: Array<{
    venue: Venue | null;
  } & Omit<Team, "venueId">> | null;
}

type TGetOne = (email: string) => Promise<GetOneResponse | undefined>;

type TRegister = (
  verifyEmailToken: string,
  verifyEmailTokenExpiration: string,
  name: string,
  email: string,
  teams?: string,
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
