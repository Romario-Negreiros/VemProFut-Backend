import Fastify from "fastify";
import userRoutes from "../routes/users";
import createDatabaseConnection from "./db";
import mailer from "./mailer";
import cors from "@fastify/cors";

import type { Connection } from "mysql2/promise";

interface IApp {
  fastify: ReturnType<typeof Fastify>;
  db: Connection;
}

class App implements IApp {
  fastify: ReturnType<typeof Fastify>;
  db!: Connection;
  mailer: typeof mailer;

  constructor() {
    this.fastify = Fastify();
    this.mailer = mailer;

    this.setRoutes();
    this.setMiddlewares();
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

  private readonly setRoutes = () => {
    userRoutes(this.fastify);
  };

  private readonly setMiddlewares = () => {
    void this.fastify.register(cors, {
      origin: "http://localhost:3333"
    })
  }

  private readonly runServer = () => {
    this.fastify.listen({ port: 5000 }, (err) => {
      if (err !== null) {
        console.log(`Erro ao rodar servidor local:\n${err.message}`);
      }
    });
  };
}

export default new App();
