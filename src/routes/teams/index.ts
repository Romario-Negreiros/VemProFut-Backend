import teamController from "../../controllers/team.controller";
import schemas from "./schemas";

import type { FastifyBaseLogger, FastifyInstance, FastifyTypeProviderDefault, RawServerDefault } from "fastify";
import type { IncomingMessage, ServerResponse } from "http";

type TFastifyInstance = FastifyInstance<
  RawServerDefault,
  IncomingMessage,
  ServerResponse<IncomingMessage>,
  FastifyBaseLogger,
  FastifyTypeProviderDefault
>;

const teamsRoutes = (app: TFastifyInstance) => {
  const baseUrl = "/api/teams";

  // GET ROUTES
  app.get(
    `${baseUrl}/get-one/:id`,
    {
      schema: schemas.getOne,
    },
    teamController.getOne
  )
};

export default teamsRoutes;
