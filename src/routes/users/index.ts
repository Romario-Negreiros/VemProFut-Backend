import userController from "../../controllers/user.controller";
import schemas from "./schemas";

import type { FastifyInstance } from "fastify";


function usersRoutes(fastify: FastifyInstance & { authenticate?: any }) {
  const baseUrl = "/api/users";

  // GET ROUTES
  fastify.get(
    `${baseUrl}/get-one/:email`,
    {
      schema: schemas.getOne
    },
    userController.getOne,
  );

  // POST ROUTES
  fastify.post(
    `${baseUrl}/register`,
    {
      schema: schemas.register,
    },
    userController.register,
  );

  // PUT ROUTES
  fastify.put(
    `${baseUrl}/verify-email/:email/:token`,
    {
      schema: schemas.verifyEmail,
    },
    userController.verifyEmail,
  );

  fastify.put(
    `${baseUrl}/update/teams`,
    {
      schema: schemas.updateTeams,
    },
    userController.updateTeams,
  );

  // DELETE ROUTES
  fastify.delete(
    `${baseUrl}/delete/:email`,
    {
      schema: schemas.delete,
    },
    userController.delete,
  );
}

export default usersRoutes;
