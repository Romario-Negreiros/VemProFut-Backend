import type { RowDataPacket } from "mysql2";

export default interface Team extends RowDataPacket {
  id: number;
  name: string;
  code?: string | null;
  country: string;
  countryFlag: string;
  founded?: number | null;
  logo: string;
  venueId?: number | null;
}
