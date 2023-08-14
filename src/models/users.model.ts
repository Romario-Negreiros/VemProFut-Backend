import type { RowDataPacket } from "mysql2";

export default interface User extends RowDataPacket {
  id?: number;
  name?: string;
  email?: string;
  created_at?: Date;
}
