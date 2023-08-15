import app from "../app";

import type User from "../models/user.model";

interface RequestBodyUser {
  name: string;
  email: string;
  teams: string;
}

interface IUserServices {
  getOne: (email: string) => Promise<User>;
  register: (user: RequestBodyUser) => Promise<void>;
}

class UserServices implements IUserServices {
  getOne = async (email: string): Promise<User> => {
    const query = `
    SELECT users.*, GROUP_CONCAT(teams.team_name) AS teams
    FROM users
    LEFT JOIN user_teams ON users.id = user_teams.user_id
    LEFT JOIN teams ON user_teams.team_id = teams.id
    WHERE email = ?`
    const [result] = await app.db.query<User[]>(query, [email]);
    return result?.[0];
  };

  register = async ({ name, email, teams }: RequestBodyUser): Promise<void> => {
    try {
      await app.db.beginTransaction();

      await app.db.query("INSERT INTO users (name, email) VALUES (?, ?)", [name, email]);

      await app.db.query("SET @user_id = LAST_INSERT_ID()");

      for (const team of teams.split(",")) {
        await app.db.query("INSERT IGNORE INTO teams (team_name) VALUES (?)", [team]);
        await app.db.query("SET @team_id = (SELECT id FROM teams WHERE team_name = ?)", [team]);
        await app.db.query("INSERT INTO user_teams (user_id, team_id) VALUES (@user_id, @team_id)");
      }

      await app.db.commit();
    } catch (err) {
      await app.db.rollback();
      throw err;
    }
  };

  updateTeams = async ({ email, teams }: Omit<RequestBodyUser, 'name'>): Promise<void> => {
  }
}

export default new UserServices();
