import app from "../app";

import type User from "../models/user.model";

interface RequestBodyUser {
  name: string;
  email: string;
  teams: string;
}

interface IUserServices {
  getOne: (email: string) => Promise<User>;
  // register: (user: RequestBodyUser) => Promise<void>;
}

class UserServices implements IUserServices {
  getOne = async (email: string): Promise<User> => {
    const query = `
      SELECT users.*, teams.teams
      FROM users
      LEFT JOIN (
      SELECT user_id, GROUP_CONCAT(team) AS teams
      FROM teams
      GROUP BY user_id
      ) teams ON users.id = teams.user_id
      WHERE users.email = ?;
    `;
    const [ result ] = await app.db.query<User[]>(query, [email]);
    return result?.[0]
  };

  register = async ({ name, email, teams }: RequestBodyUser): Promise<Promise<void>> => {
    
  };
}

export default new UserServices();
