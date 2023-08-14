import userServices from "../services/user.services";

import type { FastifyRequest, FastifyReply } from "fastify";

// req = request
// res = response

interface IUserController {
  getOne: (req: FastifyRequest, res: FastifyReply) => Promise<void>;
}

interface Params {
  email?: string;
}

class UserController implements IUserController {
  getOne = async (req: FastifyRequest, res: FastifyReply): Promise<void> => {
    const params = req.params as Params;
    if (params.email !== undefined) {
      try {
        const { email } = params;
        const user = await userServices.getOne(email);

        if (user === undefined) {
          await res.status(404).send("Usuário não encontrado.");
        }
        
        await res.status(200).send({ user });
      } catch (err) {
        console.log(err);
        await res.status(500).send("Erro no processamento interno ao tentar buscar o usuário.");
      }
    }
  };
}

export default new UserController();
