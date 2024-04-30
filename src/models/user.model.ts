import type { RowDataPacket } from "mysql2";

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
