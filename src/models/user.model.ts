import type { RowDataPacket } from "mysql2";
// import type TeamModel from "./team.model";
// import type Venue from "./venue.model";

// interface Team extends TeamModel {
//   venue: Venue | null;
// }

export default interface User extends RowDataPacket {
  id: number;
  name: string;
  password?: string;
  email: string;
  createdAt: string;
  teams: string | null;
  isActive: number;
  verifyEmailToken?: string | null;
  verifyEmailTokenExpiration?: string | null;
  resetPasswordToken?: string | null;
  resetPasswordTokenExpiration?: string | null;
}
