import type { FastifyRequest, FastifyReply } from "fastify";

export type Controller = (req: FastifyRequest, res: FastifyReply) => Promise<void>;

export interface IUserController {
  getOne: Controller;
  signUp: Controller;
  signIn: Controller;
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
  signUp: {
    name?: string;
    email?: string;
    password?: string;
    teams?: string;
  };
  signIn: Pick<IBody["signUp"], "email" | "password">;
  updateTeams: {
    newTeams?: string;
  } & Omit<IBody["signUp"], "teams">;
}
