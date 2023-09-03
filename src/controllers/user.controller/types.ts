import type { FastifyRequest, FastifyReply } from "fastify";

export type Controller = (req: FastifyRequest, res: FastifyReply) => Promise<void>;

export interface IUserController { 
  signUp: Controller;
  signIn: Controller;
  verifyEmail: Controller;
  // updateTeams: Controller;
  delete: Controller;
}

export interface RequestParams {
  email?: string;
  token?: string;
}

export interface RequestBody {
  name?: string;
  email?: string;
  password?: string;
  teams?: string;
  newTeams?: string;
}
