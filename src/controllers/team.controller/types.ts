import type { FastifyRequest, FastifyReply } from "fastify";

export type Controller = (req: FastifyRequest, res: FastifyReply) => Promise<void>;

export interface ITeamController {
  get: Controller;
}

export interface RequestParams {
  id?: number;
}
