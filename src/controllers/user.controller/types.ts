import type { FastifyRequest, FastifyReply } from "fastify";

export type Controller = (req: FastifyRequest, res: FastifyReply) => Promise<void>;

export interface IUserController {
  getOne: Controller;
  register: Controller;
  verifyEmail: Controller;
  updateTeams: Controller;
  delete: Controller;
}

export interface IParams {
  getOne: {
    email?: string;
  };
  verifyEmail: { token?: string } & IParams["getOne"];
  delete: IParams["getOne"];
}

export interface IBody {
  register: {
    name?: string;
    email?: string;
    teams?: string;
  };
  updateTeams: {
    newTeams?: string;
  } & Omit<IBody["register"], "teams">;
}
