import type { RowDataPacket } from "mysql2";
import type Team from "./team.model";
import type Venue from "./venue.model";

export default interface User extends RowDataPacket {
  id?: number;
  name?: string;
  password?: string;
  email?: string;
  createdAt?: string;
  isActive?: number;
  verifyEmailToken?: string;
  verifyEmailTokenExpiration?: string;
  teams?: Array<Team & Venue>;
}
