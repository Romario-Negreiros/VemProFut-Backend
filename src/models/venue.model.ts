import type { RowDataPacket } from "mysql2";

export default interface Venue extends RowDataPacket {
  id: number;
  name: string;
  address?: string | null;
  city?: string | null;
  capacity: number;
  surface?: string | null;
  image: string;
}
