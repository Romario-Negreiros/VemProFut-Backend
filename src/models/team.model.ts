import type { RowDataPacket } from "mysql2";

export default interface Team extends RowDataPacket {
  id?: number;
  name?: string;
  code?: string;
  country?: string;
  translatedCountry?: string;
  countryFlag?: string;
  founded?: number;
  logo?: string;
  venueId?: number;
}
