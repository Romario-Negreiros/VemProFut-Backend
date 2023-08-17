import userController from "../../controllers/user.controller";
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

function usersRoutes(app: TFastifyInstance) {
  const baseUrl = "/api/users";

  // GET ROUTES
  app.get(
    `${baseUrl}/get-one/:email`,
    {
      schema: schemas.getOne,
    },
    userController.getOne,
  );

  // POST ROUTES
  app.post(
    `${baseUrl}/register`,
    {
      schema: schemas.register,
    },
    userController.register,
  );

  // PUT ROUTES
  app.put(
    `${baseUrl}/verify-email/:email/:token`,
    {
      schema: schemas.verifyEmail,
    },
    userController.verifyEmail,
  );

  app.put(
    `${baseUrl}/update/teams`,
    {
      schema: schemas.updateTeams,
    },
    userController.updateTeams,
  );

  // DELETE ROUTES
  app.delete(
    `${baseUrl}/delete/:email`,
    {
      schema: schemas.delete,
    },
    userController.delete,
  );
}

export default usersRoutes;
