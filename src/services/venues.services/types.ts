import type Venue from "../../models/venue.model";

export interface IVenuesServices {
  get: (id: number) => Promise<Venue>;
}
