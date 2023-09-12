import app from "../../app";

import teamServices from "../team.services";

import type User from "../../models/user.model";
import type { IUserServices } from "./types";

class UserServices implements IUserServices {
  get: IUserServices["get"] = async (email, fields) => {
    if (fields) {
      const query = `SELECT ${fields.join(",")} FROM Users WHERE email = ?`;
      const [result] = await app.db.query<User[]>(query, [email]);
      if (!result?.[0]) {
        return undefined;
      } else {
        return result[0];
      }
    } else {
      const query = `
    SELECT Users.*, GROUP_CONCAT(Teams.id) AS teams 
    FROM Users 
    LEFT JOIN Users_Teams ON Users.id = Users_Teams.userId 
    LEFT JOIN Teams ON Users_Teams.teamId = Teams.id 
    WHERE email = ? GROUP BY Users.id`;
      const [result] = await app.db.query<User[]>(query, [email]);
      if (!result?.[0]) {
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
            if (team) teams.push({ ...team });
          }
          return { ...user, teams };
        }
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

      await app.db.query(
        "INSERT INTO Users (name, email, password, verifyEmailToken, verifyEmailTokenExpiration) VALUES (?, ?, ?, ?, ?)",
        [name, email, password, verifyEmailToken, verifyEmailTokenExpiration],
      );

      await app.db.query("SET @userId = LAST_INSERT_ID()");

      if (teams) {
        for (const team of teams) {
          await app.db.query(
            "INSERT INTO Users_Teams (userId, teamId, noUserWithSameTeam) VALUES (@userId, ?, CONCAT(@userId, ?))",
            [+team, +team],
          );
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
            await app.db.query(
              "INSERT IGNORE INTO Users_Teams (userId, teamId, noUserWithSameTeam) VALUES (@userId, ?, CONCAT(@userId, ?))",
              [team, team],
            );
          }
        }
        await app.db.commit();
      } catch (error) {
        await app.db.rollback();
        throw error;
      }
    }
  };

  delete: IUserServices["delete"] = async (email) => {
    try {
      await app.db.beginTransaction();

      await app.db.query("SET @userId = (SELECT id FROM Users WHERE email = ?)", [email]);

      await app.db.query("DELETE FROM Users_Teams WHERE userId = @userId");

      await app.db.query("DELETE FROM Users WHERE email = ?", [email]);

      await app.db.commit();
    } catch (error) {
      await app.db.rollback();
      throw error;
    }
  };
}

export default new UserServices();
