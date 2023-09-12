import type TeamModel from "../../models/team.model";
import type Venue from "../../models/venue.model";

interface Team extends TeamModel {
  venue?: Venue | null;
}

export interface ITeamServices {
  get: (id: number) => Promise<Team | undefined>;
}
