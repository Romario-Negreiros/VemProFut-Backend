import app from "../../app";

import teamServices from "../team.services";
import venuesServices from "../venues.services";
import bcrypt from "bcryptjs";

import type Team from "../../models/team.model";
import type User from "../../models/user.model";
import type { IUserServices } from "./types";

class UserServices implements IUserServices {
  get: IUserServices["get"] = async (email) => { // refactor: get only some fields of user
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
      const user = result[0];
      if (!user.teams) {
        return { ...user };
      } else {
        const teams = [];
        const userTeamsIds = user.teams as unknown as string;
        for (const teamId of userTeamsIds?.split(",")) {
          const team = await teamServices.get(+teamId);
          if (team) {
            let venue;
            if (team.venueId) {
              venue = await venuesServices.get(team.venueId);
            }
            teams.push({ ...team, venue });
          }
        }
        return { ...user, teams };
      }
    }
  };

  create: IUserServices["create"] = async (
    name,
    email,
    password,
    verifyEmailToken,
    verifyEmailTokenExpiration,
    teams,
  ) => {
    try {
      await app.db.beginTransaction();

      const hash = await bcrypt.hash(password, 15);

      await app.db.query(
        "INSERT INTO Users (name, email, password, verifyEmailToken, verifyEmailTokenExpiration) VALUES (?, ?, ?, ?, ?)",
        [name, email, hash, verifyEmailToken, verifyEmailTokenExpiration],
      );

      await app.db.query("SET @userId = LAST_INSERT_ID()");

      if (teams !== undefined) {
        for (const team of teams.split(",")) {
          await app.db.query("INSERT INTO Users_Teams (userId, teamId, noUserWithSameTeam) VALUES (@userId, ?, CONCAT(@userId, ?))", [+team, +team]);
        }
      }

      await app.db.commit();
    } catch (error) {
      await app.db.rollback();
      throw error;
    }
  };

  update: IUserServices["update"] = async (
    email,
    columnsToUpdate,
    columnsInWhereClause,
    whereComparision,
    userTeams,
  ) => {
    if (Object.keys(columnsToUpdate).length > 0) {
      let query = "UPDATE Users SET ";
      const valuesToUpdate: Array<string | number | null> = [];
      let colToUpdate: keyof typeof columnsToUpdate;
      for (colToUpdate in columnsToUpdate) {
        query += colToUpdate + " = ?, ";
        valuesToUpdate.push(columnsToUpdate[colToUpdate] as string | number | null);
      }

      query = query.substring(0, query.length - 2) + " WHERE ";
      let colInWhere: keyof typeof columnsInWhereClause;
      for (colInWhere in columnsInWhereClause) {
        if (whereComparision) {
          query += colInWhere + " = ? " + whereComparision + " ";
        } else {
          query += colInWhere + " = ?";
        }
        valuesToUpdate.push(columnsInWhereClause[colInWhere] as string | number | null);
      }

      if (whereComparision) {
        query = query.substring(0, query.length - (whereComparision.length + 2));
      }

      await app.db.query(query, valuesToUpdate);
    }

    if (userTeams) {
      const { removeAll, teamsToRemove, teamsToAdd } = userTeams;
      try {
        await app.db.beginTransaction();

        await app.db.query("SET @userId = (SELECT id FROM Users WHERE email = ?)", [email]);

        if (removeAll) {
          await app.db.query("DELETE FROM Users_Teams WHERE userId = @userId");
        } else {
          for (const team of teamsToRemove) {
            await app.db.query("DELETE FROM Users_Teams WHERE userId = @userId and teamId = ?", [team]);
          }

          for (const team of teamsToAdd) {
            await app.db.query("INSERT IGNORE INTO Users_Teams (userId, teamId, noUserWithSameTeam) VALUES (@userId, ?, CONCAT(@userId, ?))", [team, team]);
          }
        }
        await app.db.commit();
      } catch (error) {
        await app.db.rollback();
        throw error;
      }
    }
  };

  verifyEmail: IUserServices["verifyEmail"] = async (email, token) => {
    await app.db.query(
      "UPDATE users SET verifyEmailToken = ?, verifyEmailTokenExpiration = ?, isActive = ? WHERE verifyEmailToken = ? and email = ?",
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

  delete: IUserServices["delete"] = async (email) => {
    try {
      await app.db.beginTransaction();

      await app.db.query("SET @userId = (SELECT id FROM Users WHERE email = ?)", [email]);

      await app.db.query("DELETE FROM Users_Teams WHERE userId = @userId");

      await app.db.query("DELETE FROM Users WHERE email = ?", [email]);

      await app.db.commit();
    } catch (err) {
      await app.db.rollback();
      throw err;
    }
  };
}

export default new UserServices();
