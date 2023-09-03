import app from "../../app";

import type { IVenuesServices } from "./types";
import type Venue from "../../models/venue.model";

class VenuesServices implements IVenuesServices {
  get: IVenuesServices["get"] = async (id) => {
    const [results] = await app.db.query<Venue[]>("SELECT * FROM Venues WHERE id = ?", [id]);

    return results[0];
  };
}

export default new VenuesServices();
