import app from "../../app";

import type Team from "../../models/team.model";
import type User from "../../models/user.model";
import type Venue from "../../models/venue.model";
import type { IUserServices } from "./types";

class UserServices implements IUserServices {
  getOne: IUserServices["getOne"] = async (email) => {
    const query = `
    SELECT Users.*, GROUP_CONCAT(Teams.id) AS teams 
    FROM Users 
    LEFT JOIN Users_Teams ON Users.id = Users_Teams.userId 
    LEFT JOIN Teams ON Users_Teams.teamId = Teams.id 
    WHERE email = ? GROUP BY Users.id`;
    const [result] = await app.db.query<User[]>(query, [email]);
    if (result?.[0] === undefined) {
      return undefined;
    } else {
      const user = result?.[0];
      if (user.teams !== undefined && user.teams !== null) {
        const teams = [];
        const userTeamsIds = user.teams as unknown as string
        for (const teamId of userTeamsIds?.split(",")) {
          const [teamQueryRes] = await app.db.query<Team[]>("SELECT * FROM Teams where id = ?", [+teamId]);
          const team = teamQueryRes?.[0];
          if (team === undefined) continue;
          const [venueQueryRes] = await app.db.query<Venue[]>("SELECT * FROM Venues where id = ?", [team.venueId]);
          const venue = venueQueryRes?.[0];
          delete team.venueId;
          if (venue === undefined) {
            teams.push({ ...team, venue: null });
          } else {
            teams.push({ ...team, venue });
          }
        }
        return { ...user, teams: [...teams] };
      } else {
        return { ...user, teams: null };
      }
    }
  };

  register: IUserServices["register"] = async (verifyEmailToken, verifyEmailTokenExpiration, name, email, teams) => {
    try {
      await app.db.beginTransaction();

      await app.db.query(
        "INSERT INTO Users (name, email, verifyEmailToken, verifyEmailTokenExpiration) VALUES (?, ?, ?, ?)",
        [name, email, verifyEmailToken, verifyEmailTokenExpiration],
      );

      await app.db.query("SET @userId = LAST_INSERT_ID()");

      if (teams !== undefined) {
        for (const team of teams.split(",")) {
          await app.db.query("INSERT INTO Users_Teams (userId, teamId) VALUES (@userId, ?)", [+team]);
        }
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

  updateTeams: IUserServices["updateTeams"] = async (newTeamsIds, user) => {
    try {
      await app.db.beginTransaction();

      if (newTeamsIds === "") {
        await app.db.query("DELETE FROM Users_Teams WHERE userId = ?", [user.id]);
      } else if (user.teams !== undefined && user.teams !== null) {
        const userTeams = user.teams as unknown as Team[];
        for (const newTeamId of newTeamsIds.split(",")) {
          if (!userTeams.some((userTeam) => userTeam.id === +newTeamId)) {
            await app.db.query("INSERT INTO Users_Teams (userId, teamId) VALUES (?, ?)", [user.id, +newTeamId]);
          }
        }

        const teamsToRemove: number[] = [];
        userTeams.forEach((userTeam) => {
          if (!newTeamsIds.split(",").includes(String(userTeam.id))) {
            teamsToRemove.push(userTeam.id as number);
          }
        });

        if (teamsToRemove !== undefined && teamsToRemove.length > 0) {
          for (const team of teamsToRemove) {
            await app.db.query("DELETE FROM Users_Teams WHERE userId = ? AND teamId = ?", [user.id, team]);
          }
        }
      } else {
        for (const newTeamId of newTeamsIds.split(",")) {
          await app.db.query("INSERT INTO Users_Teams (userId, teamId) VALUES (?, ?)", [user.id, +newTeamId]);
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

      if (user.teams !== null) {
        await app.db.query("DELETE FROM Users_Teams WHERE userId = ?", [user.id]);
      }

      await app.db.query("DELETE FROM Users WHERE email = ?", [user.email]);

      await app.db.commit();
    } catch (err) {
      await app.db.rollback();
      throw err;
    }
  };
}

export default new UserServices();
