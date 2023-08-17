import userController from "../controllers/user.controller";

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
      schema: {
        params: {
          email: {
            type: "string",
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              user: {
                id: { type: "number" },
                name: { type: "string" },
                email: { type: "string" },
                teams: { type: "array" },
                created_at: { type: "string" },
                is_active: { type: "number" },
              },
            },
          },
          400: {
            type: "string",
          },
          404: {
            type: "string",
          },
          500: {
            type: "string",
          },
        },
      },
    },
    userController.getOne,
  );

  // POST ROUTES
  app.post(
    `${baseUrl}/register`,
    {
      schema: {
        body: {
          email: {
            type: "string",
          },
          teams: {
            type: "string",
          },
        },
        response: {
          201: {
            type: "string",
          },
          400: {
            type: "string",
          },
          500: {
            type: "string",
          },
        },
        headers: {
          type: "object",
          properties: {
            "Content-Type": {
              type: "string",
            },
          },
          required: ["Content-Type"],
        },
      },
    },
    userController.register,
  );

  // PUT ROUTES
  app.put(
    `${baseUrl}/verify-email/:email/:token`,
    {
      schema: {
        params: {
          email: {
            type: "string",
          },
          token: {
            type: "string",
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              user: {
                id: { type: "number" },
                name: { type: "string" },
                email: { type: "string" },
                teams: { type: "array" },
                created_at: { type: "string" },
                is_active: { type: "number" },
              },
            },
          },
          400: {
            type: "string",
          },
          404: {
            type: "string",
          },
          500: {
            type: "string",
          },
        },
      },
    },
    userController.verifyEmail,
  );

  app.put(
    `${baseUrl}/update/teams`,
    {
      schema: {
        body: {
          email: {
            type: "string",
          },
          teams: {
            type: "string",
          },
        },
        headers: {
          type: "object",
          properties: {
            "Content-Type": {
              type: "string",
            },
          },
          required: ["Content-Type"],
        },
        response: {
          200: {
            type: "string",
          },
          400: {
            type: "string",
          },
          404: {
            type: "string",
          },
          500: {
            type: "string",
          },
        },
      },
    },
    userController.updateTeams,
  );

  // DELETE ROUTES
  app.delete(
    `${baseUrl}/delete/:email`,
    {
      schema: {
        params: {
          email: {
            type: "string",
          },
        },
        response: {
          200: {
            type: "string",
          },
          400: {
            type: "string",
          },
          404: {
            type: "string",
          },
          500: {
            type: "string",
          },
        },
        headers: {
          type: "object",
          properties: {
            "Content-Type": {
              type: "string",
            },
          },
          required: ["Content-Type"],
        },
      },
    },
    userController.delete,
  );
}

export default usersRoutes;
