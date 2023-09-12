import app from "../../app";

import venuesServices from "../venues.services/";

import type { ITeamServices } from "./types";
import type Team from "../../models/team.model";

class TeamServices implements ITeamServices {
  get: ITeamServices["get"] = async (id) => {
    const [result] = await app.db.query<Team[]>("SELECT * FROM Teams WHERE id = ?", [id]);
    
    if (result?.[0] === undefined) {
      return undefined;
    } else {
      const team = result[0];
      let venue = null;
      if (team.venueId) {
        venue = await venuesServices.get(team.venueId);
      }
      delete team.venueId;
      return { ...team, venue };
    }
  };
}

export default new TeamServices();
