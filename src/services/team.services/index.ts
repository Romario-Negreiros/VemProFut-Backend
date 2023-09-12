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
      if (team.venueId) {
        const venue = venuesServices.get(team.venueId);
        delete team.venueId;
        return { ...team, venue };
      } else {
        delete team.venueId;
        return { ...team, venue: null };
      }
    }
  };
}

export default new TeamServices();
