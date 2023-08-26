import type Team from "../../models/team.model";
import type Venue from "../../models/venue.model";

interface GetOneResponse extends Omit<Team, "venueId"> {
  venue: Venue | null;
}

type TGetOne = (id: number) => Promise<GetOneResponse | undefined>

export interface ITeamServices {
  getOne: TGetOne;
}