import userController from "../../controllers/user.controller";
import schemas from "./schemas";

import type { FastifyInstance } from "fastify";

function usersRoutes(fastify: FastifyInstance & { authenticate?: any }) {
  const baseUrl = "/api/users";

  // POST ROUTES
  fastify.post(
    `${baseUrl}/sign-up`,
    {
      schema: schemas.signUp,
    },
    userController.signUp,
  );

  fastify.post(
    `${baseUrl}/sign-in`,
    {
      schema: schemas.signIn
    },
    userController.signIn
  )

  // PUT ROUTES
  fastify.put(
    `${baseUrl}/verify-email/:email/:token`,
    {
      schema: schemas.verifyEmail,
    },
    userController.verifyEmail,
  );

  // fastify.put(
  //   `${baseUrl}/update/teams`,
  //   {
  //     schema: schemas.updateTeams, refactor
  //   },
  //   userController.updateTeams,
  // );

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
