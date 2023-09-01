import Fastify from "fastify";
import usersRoutes from "../routes/users";
import teamsRoutes from "../routes/teams";
import createDatabaseConnection from "./db";
import mailer from "./mailer";
import cors from "@fastify/cors";
import fastifyJWT from "@fastify/jwt";
import jwtPlugin from "../plugins/jwt.plugin";

import env from "../config/env.config";

import type { Connection } from "mysql2/promise";
import type { FastifyInstance } from "fastify";

interface IApp {
  fastify: FastifyInstance & { authenticate?: any };
  db: Connection;
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
    } catch (err) {
      if (err instanceof Error) {
        console.log(`Erro ao tentar se conectar com banco de dados:\n${err.message}`);
      }
    }
  };

  private readonly setPlugins = () => {
    void this.fastify.register(cors, {
      origin: "http://localhost:3333",
    });
    void this.fastify.register(fastifyJWT, {
      secret: env.appSecret
    })
    void this.fastify.decorate("authenticate", jwtPlugin);
  };
  
  private readonly setRoutes = () => {
    usersRoutes(this.fastify);
    teamsRoutes(this.fastify);
  };

  private readonly runServer = () => {
    this.fastify.listen({ port: 5000 }, (err) => {
      if (err !== null) {
        console.log(`Erro ao rodar servidor local:\n${err.message}`);
      }
    });
  };
}

export default new App();
