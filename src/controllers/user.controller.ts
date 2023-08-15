import userServices from "../services/user.services";

import type { FastifyRequest, FastifyReply } from "fastify";

// req = request
// res = response

interface IUserController {
  getOne: (req: FastifyRequest, res: FastifyReply) => Promise<void>;
  register: (req: FastifyRequest, res: FastifyReply) => Promise<void>;
}

interface Params {
  email?: string;
}

interface RequestBodyUser {
  name: string;
  email: string;
  teams: string;
}

class UserController implements IUserController {
  getOne = async (req: FastifyRequest, res: FastifyReply): Promise<void> => {
    const params = req.params as Params;
    if (params.email !== undefined) {
      try {
        const { email } = params;
        const user = await userServices.getOne(email);

        if (user === undefined) {
          return await res.status(404).send("Usuário não encontrado.");
        }

        await res.status(200).send({ user: { ...user, teams: user.teams?.split(",") } });
      } catch (err) {
        console.log(err);
        await res.status(500).send("Erro no processamento interno ao tentar buscar o usuário.");
      }
    }
  };

  register = async (req: FastifyRequest, res: FastifyReply): Promise<void> => {
    const body = req.body as RequestBodyUser;
    if (body.name === undefined || body.name === null) {
       return await res.status(400).send("O campo 'nome' está faltando na requisição.");
    }

    if (body.email === undefined || body.email === null) {
      return await res.status(400).send("O campo 'email' está faltando na requisição.");
    }

    if (body.teams === undefined || body.teams === null || body.teams.length === 0) {
      return await res.status(400).send("O campo 'time(s)' está faltando na requisição.");
    }

    try {
      await userServices.register(body);

      await res.status(201).send(`Você foi registrado com sucesso, ${body.name}`);
    } catch (err) {
      console.log(err);
      await res.status(500).send("Erro no processamento interno ao tentar buscar o usuário.");
    }
  };
}

export default new UserController();
