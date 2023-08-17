import userServices from "../services/user.services";
import crypto from "crypto";

import type { FastifyRequest, FastifyReply } from "fastify";

// req = request
// res = response

interface IUserController {
  getOne: (req: FastifyRequest, res: FastifyReply) => Promise<void>;
  register: (req: FastifyRequest, res: FastifyReply) => Promise<void>;
}

interface Params {
  email?: string;
  token?: string;
}

interface RequestBodyUser {
  name: string;
  email: string;
  teams: string;
}

class UserController implements IUserController {
  getOne = async (req: FastifyRequest, res: FastifyReply): Promise<void> => {
    const params = req.params as Params;
    if (params.email === undefined) {
      return await res.status(400).send("Parâmetro 'email' está vazio.");
    }

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

    if (body.teams.split(",").length > 3) {
      return await res.status(400).send("Você só pode acompanhar até três times!");
    }

    try {
      const verifyEmailToken = crypto.randomBytes(10).toString("hex");
      const verifyEmailTokenExpiration = new Date();
      verifyEmailTokenExpiration.setHours(verifyEmailTokenExpiration.getHours() + 1);

      await userServices.register(body, verifyEmailToken, verifyEmailTokenExpiration.toISOString());

      await res
        .status(201)
        .send(
          `Você foi registrado com sucesso, ${body.name}. Verifique seu email para começar a receber as notificações semanais.`,
        );
    } catch (err) {
      console.log(err);
      await res.status(500).send("Erro no processamento interno ao tentar registrar o usuário.");
    }
  };

  verifyEmail = async (req: FastifyRequest, res: FastifyReply): Promise<void> => {
    const params = req.params as Params;
    if (params.email === undefined) {
      return await res.status(400).send("Parâmetro 'email' está vazio.");
    }

    if (params.token === undefined) {
      return await res.status(400).send("Parâmetro 'token' está vazio.");
    }

    try {
      const user = await userServices.getOne(params.email);

      if (user === undefined) {
        return await res.status(404).send("Usuário não encontrado.");
      }

      if (user.verify_email_token === undefined || user.verify_email_token_expiration === undefined) {
        return await res.status(400).send("Usuário com o email já verificado.");
      }

      const now = new Date();
      const tokenExpiration = new Date(user.verify_email_token_expiration);

      if (now > tokenExpiration) {
        await userServices.delete(user);

        return await res.status(400).send("O token de validação de email expirou, crie sua conta novamente.");
      }

      if (params.token !== user.verify_email_token) {
        return await res.status(400).send("Token inválido.");
      }

      await userServices.verifyEmail(params.email, params.token);

      user.is_active = 1;
      delete user.verify_email_token;
      delete user.verify_email_token_expiration;

      await res.status(200).send({ user: { ...user, teams: user.teams?.split(",") } });
    } catch (err) {
      console.log(err);
      await res.status(500).send("Erro no processamento interno ao tentar verificar o email do usuário.");
    }
  };

  updateTeams = async (req: FastifyRequest, res: FastifyReply): Promise<void> => {
    const body = req.body as Omit<RequestBodyUser, "name">;
    if (body.email === undefined || body.email === null) {
      return await res.status(400).send("O campo 'email' está faltando na requisição.");
    }

    if (body.teams === undefined || body.teams === null || body.teams.length === 0) {
      return await res.status(400).send("O campo 'time(s)' está faltando na requisição.");
    }

    if (body.teams.split(",").length > 3) {
      return await res.status(400).send("Você só pode acompanhar até três times!");
    }

    try {
      const user = await userServices.getOne(body.email);

      if (user === undefined) {
        return await res.status(404).send("Usuário não encontrado.");
      }

      await userServices.updateTeams(body.teams, user);

      await res.status(201).send(`Seus times foram atualizados com sucesso.`);
    } catch (err) {
      console.log(err);
      await res.status(500).send("Erro no processamento interno ao tentar atualizar os times do usuário.");
    }
  };

  delete = async (req: FastifyRequest, res: FastifyReply): Promise<void> => {
    const params = req.params as Params;
    if (params.email === undefined) {
      return await res.status(400).send("Parâmetro 'email' está vazio.");
    }

    try {
      const user = await userServices.getOne(params.email);

      if (user === undefined) {
        return await res.status(404).send("Usuário não encontrado.");
      }

      await userServices.delete(user);

      await res.status(200).send("Usuário deletado com sucesso.");
    } catch (err) {
      console.log(err);
      await res.status(500).send("Erro no processamento interno ao tentar deletar o usuário.");
    }
  };
}

export default new UserController();
