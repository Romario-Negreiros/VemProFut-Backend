import Fastify from "fastify";
import usersRoutes from "../routes/users.routes";

interface IApp {
  fastify: ReturnType<typeof Fastify>;
}

class App implements IApp {
  fastify: ReturnType<typeof Fastify>;

  constructor() {
    this.fastify = Fastify();

    this.setRoutes();
    this.runServer();
  }

  private readonly setRoutes = () => {
    usersRoutes(this.fastify);
  };

  private readonly runServer = () => {
    this.fastify.listen({ port: 5000 }, () => {});
  };
}

export default new App().fastify;
