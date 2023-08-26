import app from "../../app";

import type { ITeamServices } from "./types";
import type Team from "../../models/team.model";
import type Venue from "../../models/venue.model";

class TeamServices implements ITeamServices {
  getOne: ITeamServices["getOne"] = async (id) => {
    const [result] = await app.db.query<Team[]>("SELECT * FROM Teams WHERE id = ?", [id]);
    if (result?.[0] === undefined) {
      return undefined;
    } else {
      const team = result?.[0];
      const [venueQueryResult] = await app.db.query<Venue[]>("SELECT * FROM Venues WHERE id = ?", [team.venueId]);
      if (venueQueryResult?.[0] === undefined) {
        delete team.venueId;
        return { ...team, venue: null };
      } else {
        const venue = venueQueryResult?.[0];
        delete team.venueId;
        return { ...team, venue };
      }
    }
  };
}

export default new TeamServices();
