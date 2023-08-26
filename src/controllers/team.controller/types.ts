import type { FastifyRequest, FastifyReply } from "fastify";

export type Controller = (req: FastifyRequest, res: FastifyReply) => Promise<void>;

export interface ITeamController {
  getOne: Controller;
}

export interface IParams {
  getOne: {
    id?: number;
  };
}
