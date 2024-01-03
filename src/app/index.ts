import Fastify from "fastify";
import usersRoutes from "../routes/users";
import teamsRoutes from "../routes/teams";
import createDatabaseConnection from "./db";
import mailer from "./mailer";
import cors from "@fastify/cors";
import fastifyJWT from "@fastify/jwt";
import jwtPlugin from "../plugins/jwt.plugin";

import env from "../config/env.config";
import teams from "../../public/data/teams.json";
import venues from "../../public/data/venues.json";

import type { Connection } from "mysql2/promise";
import type { RowDataPacket } from "mysql2";
import type { FastifyInstance } from "fastify";

interface IApp {
  fastify: FastifyInstance & { authenticate?: any };
  db: Connection;
}

interface CountRows extends RowDataPacket {
  totalRowsInTeamsTable: number;
}

class App implements IApp {
  fastify: FastifyInstance & { authenticate?: any };
  db!: Connection;
  mailer: typeof mailer;

  constructor() {
    this.fastify = Fastify();
    this.mailer = mailer;

    this.setPlugins();
    this.setRoutes();
    void this.setDatabase();
    this.runServer();
  }

  private readonly setDatabase = async () => {
    try {
      this.db = await createDatabaseConnection();

      this.seedDatabase();
    } catch (error) {
      if (error instanceof Error) {
        console.log(`Erro ao tentar se conectar com banco de dados:\n${error.message}`);
      }
    }
  };

  private readonly setPlugins = () => {
    void this.fastify.register(cors, {
      origin: "http://localhost:3333",
    });
    void this.fastify.register(fastifyJWT, {
      secret: env.appSecret,
    });
    void this.fastify.decorate("authenticate", jwtPlugin);
  };

  private readonly setRoutes = () => {
    usersRoutes(this.fastify);
    teamsRoutes(this.fastify);
  };

  private readonly runServer = () => {
    this.fastify.listen({ port: 5000 }, (error) => {
      if (error) {
        console.log(`Erro ao rodar servidor local:\n${error.message}`);
      }
    });
  };

  private readonly seedDatabase = async () => {
    try {
      await this.db.beginTransaction();

      const [result] = await this.db.query<CountRows[]>("SELECT COUNT(id) AS totalRowsInTeamsTable FROM TEAMS");
      if (result?.[0]) {
        const { totalRowsInTeamsTable } = result[0];
        if (totalRowsInTeamsTable > 0) return;
      }
      for (const venue of venues) {
        await this.db.query(
          `
          INSERT IGNORE INTO VENUES (
            id,
            name,
            address,
            city,
            capacity,
            surface,
            image
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
          `,
          [venue.id, venue.name, venue.address, venue.city, venue.capacity, venue.surface, venue.image],
        );
      }

      for (const team of teams) {
        await this.db.query(
          `
          INSERT INTO TEAMS (
            id,
            name,
            code,
            country,
            founded,
            logo,
            venueId
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
          [team.id, team.name, team.code, team.country, team.founded, team.logo, team.venueId],
        );
      }

      await this.db.commit();
    } catch (err) {
      await this.db.rollback();

      if (err instanceof Error) console.log(err.message);
    }
  };
}

export default new App();
