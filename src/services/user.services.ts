import connection from "../app/db";

import type User from "../models/user.model";

interface IUserServices {
  getOne: (email: string) => Promise<User>;
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
    return await new Promise((resolve, reject) => {
      connection.query<User[]>(query, [email], (err, results) => {
        if (err !== null) {
          reject(err);
        } else {
          resolve(results?.[0]);
        }
      });
    });
  };
}

export default new UserServices();
