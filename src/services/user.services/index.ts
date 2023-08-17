import app from "../../app";

import type User from "../../models/user.model";
import type { IUserServices } from "./types";

class UserServices implements IUserServices {
  getOne: IUserServices["getOne"] = async (email) => {
    const query = `
    SELECT users.*, GROUP_CONCAT(teams.team_name) AS teams
    FROM users
    LEFT JOIN user_teams ON users.id = user_teams.user_id
    LEFT JOIN teams ON user_teams.team_id = teams.id
    WHERE email = ?`;
    const [result] = await app.db.query<User[]>(query, [email]);
    return result?.[0].id !== null ? result?.[0] : undefined;
  };

  register: IUserServices["register"] = async (
    name,
    email,
    teams,
    verifyEmailToken,
    verifyEmailTokenExpiration) => {
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
          token: verifyEmailToken,
        },
      });

      await app.db.commit();
    } catch (err) {
      await app.db.rollback();
      throw err;
    }
  };

  verifyEmail: IUserServices["verifyEmail"] = async (email, token) => {
    await app.db.query(
      "UPDATE users SET verify_email_token = ?, verify_email_token_expiration = ?, is_active = ? WHERE verify_email_token = ? and email = ?",
      [null, null, true, token, email],
    );
  };

  updateTeams: IUserServices["updateTeams"] = async (teams, user) => {
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

  delete: IUserServices["delete"] = async (user) => {
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
