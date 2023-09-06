import teamController from "../../controllers/team.controller";
import schemas from "./schemas";

import type { FastifyInstance } from "fastify";

const teamsRoutes = (app: FastifyInstance) => {
  const baseUrl = "/api/teams";

  // GET ROUTES
  app.get(
    `${baseUrl}/get/:id`,
    {
      schema: schemas.get,
    },
    teamController.get,
  );
};

export default teamsRoutes;
