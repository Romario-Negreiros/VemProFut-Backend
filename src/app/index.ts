import Fastify from "fastify";
import userRoutes from "../routes/user.routes";

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
    userRoutes(this.fastify);
  };

  private readonly runServer = () => {
    this.fastify.listen({ port: 5000 }, (err) => {
      if (err !== null) {
        console.log(`Erro ao rodar servidor local:\n${err.message}`);
      }
    });
  };
}

export default new App().fastify;
