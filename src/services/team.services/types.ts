import type Team from "../../models/team.model";

export interface ITeamServices {
  get: (id: number) => Promise<Team | undefined>;
}
