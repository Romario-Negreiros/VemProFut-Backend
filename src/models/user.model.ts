import type { RowDataPacket } from "mysql2";

export default interface User extends RowDataPacket {
  id?: number;
  name?: string;
  email?: string;
  teams?: string;
  created_at?: string;
  is_active?: number;
  verify_email_token?: string;
  verify_email_token_expiration?: string;
}
