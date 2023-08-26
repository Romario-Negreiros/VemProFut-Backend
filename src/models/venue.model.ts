import type { RowDataPacket } from "mysql2";

export default interface Venue extends RowDataPacket {
  id?: number;
  name?: string;
  address?: string;
  city?: string;
  capacity?: number;
  surface?: string;
  image?: string;
}
