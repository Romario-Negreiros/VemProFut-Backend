import type { RowDataPacket } from "mysql2";

export default interface Team extends RowDataPacket {
  id?: number;
  user_id?: number;
  team?: string;
}
