import app from "../app";

import type User from "../models/user.model";

interface RequestBodyUser {
  name: string;
  email: string;
  teams: string;
}

interface IUserServices {
  getOne: (email: string) => Promise<User | undefined>;
  register: (user: RequestBodyUser, verifyEmailToken: string, verifyEmailTokenExpiration: string) => Promise<void>;
}

class UserServices implements IUserServices {
  getOne = async (email: string): Promise<User | undefined> => {
    const query = `
    SELECT users.*, GROUP_CONCAT(teams.team_name) AS teams
    FROM users
    LEFT JOIN user_teams ON users.id = user_teams.user_id
    LEFT JOIN teams ON user_teams.team_id = teams.id
    WHERE email = ?`;
    const [result] = await app.db.query<User[]>(query, [email]);
    return result?.[0].id !== null ? result?.[0] : undefined;
  };

  register = async (
    { name, email, teams }: RequestBodyUser,
    verifyEmailToken: string,
    verifyEmailTokenExpiration: string,
  ): Promise<void> => {
    try {
      await app.db.beginTransaction();

      await app.db.query(
        "INSERT INTO users (name, email, verify_email_token, verify_email_token_expiration) VALUES (?, ?, ?, ?)",
        [name, email, verifyEmailToken, verifyEmailTokenExpiration],
      );

      await app.db.query("SET @user_id = LAST_INSERT_ID()");

      for (const team of teams.split(",")) {
        await app.db.query("INSERT IGNORE INTO teams (team_name) VALUES (?)", [team]);
        await app.db.query("SET @team_id = (SELECT id FROM teams WHERE team_name = ?)", [team]);
        await app.db.query("INSERT INTO user_teams (user_id, team_id) VALUES (@user_id, @team_id)");
      }

      
      await app.mailer.send({
        to: email,
        subject: "Verify your email address",
        templateName: "verify-email",
        templateVars: {
          name,
          email,
          token: verifyEmailToken
        }
      });

      await app.db.commit();
    } catch (err) {
      await app.db.rollback();
      throw err;
    }
  };

  updateTeams = async (teams: string, user: User): Promise<void> => {
    try {
      await app.db.beginTransaction();

      for (const team of teams.split(",")) {
        if (user.teams !== undefined && !user.teams?.split(",").includes(team)) {
          await app.db.query("INSERT IGNORE INTO teams (team_name) VALUES (?)", [team]);
          await app.db.query("SET @team_id = (SELECT id FROM teams WHERE team_name = ?)", [team]);
          await app.db.query("INSERT INTO user_teams (user_id, team_id) VALUES (?, @team_id)", [user.id]);
        }
      }

      const teamsToRemove = user.teams?.split(",").filter((team) => {
        if (!teams.split(",").includes(team)) {
          return team;
        }
        return null;
      });

      if (teamsToRemove !== undefined && teamsToRemove.length > 0) {
        for (const team of teamsToRemove) {
          await app.db.query("SET @team_id = (SELECT id FROM teams WHERE team_name = ?)", [team]);
          await app.db.query("DELETE FROM user_teams WHERE user_id = ? AND team_id = @team_id", [user.id]);
          await app.db.query(
            "DELETE FROM teams WHERE team_name = ? AND NOT EXISTS (SELECT 1 FROM user_teams WHERE team_id = @team_id)",
            [team],
          );
        }
      }
      await app.db.commit();
    } catch (err) {
      await app.db.rollback();
      throw err;
    }
  };

  delete = async (user: User): Promise<void> => {
    try {
      await app.db.beginTransaction();

      await app.db.query("DELETE FROM user_teams WHERE user_id = ?", [user.id]);

      await app.db.query("DELETE FROM users WHERE email = ?", [user.email]);

      if (user.teams !== undefined) {
        for (const team of user.teams?.split(",")) {
          await app.db.query("SET @team_id = (SELECT id FROM teams WHERE team_name = ?)", [team]);
          await app.db.query(
            "DELETE FROM teams WHERE team_name = ? AND NOT EXISTS (SELECT 1 FROM user_teams WHERE team_id = @team_id)",
            [team],
          );
        }
      }

      await app.db.commit();
    } catch (err) {
      await app.db.rollback();
      throw err;
    }
  };
}

export default new UserServices();
