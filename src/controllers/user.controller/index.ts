import userServices from "../../services/user.services";
import crypto from "crypto";

import type { Controller, IUserController, IParams, IBody } from "./types";
import type { QueryError } from "mysql2";

// req = request
// res = response

class UserController implements IUserController {
  getOne: Controller = async (req, res) => {
    const { email } = req.params as IParams["getOne"];
    if (email === undefined) {
      return await res.status(400).send("Parâmetro 'email' está vazio.");
    }

    try {
      const user = await userServices.getOne(email);

      if (user === undefined) {
        return await res.status(404).send("Usuário não encontrado.");
      }

      await res.status(200).send({ user });
    } catch (err) {
      console.log(err);
      await res.status(500).send("Erro no processamento interno ao tentar buscar o usuário.");
    }
  };

  register: Controller = async (req, res) => {
    const { name, email, teams } = req.body as IBody["register"];
    if (name === undefined || name === null) {
      return await res.status(400).send("O campo 'nome' está faltando na requisição.");
    }

    if (email === undefined || email === null) {
      return await res.status(400).send("O campo 'email' está faltando na requisição.");
    }

    if (teams !== undefined && teams?.split(",").length > 3) {
      return await res.status(400).send("Você só pode acompanhar até três times!");
    }

    try {
      const verifyEmailToken = crypto.randomBytes(10).toString("hex");
      const verifyEmailTokenExpiration = new Date();
      verifyEmailTokenExpiration.setHours(verifyEmailTokenExpiration.getHours() + 1);

      await userServices.register(verifyEmailToken, verifyEmailTokenExpiration.toISOString(), name, email, teams);

      await res
        .status(201)
        .send(
          `Você foi registrado com sucesso, ${name}. Verifique seu email para começar a receber as notificações semanais.`,
        );
    } catch (err) {
      console.log(err);
      const error = err as QueryError;
      if (error.errno === 1062) {
        return await res.status(400).send("O usuário já está registrado.");
      }

      await res.status(500).send("Erro no processamento interno ao tentar registrar o usuário.");
    }
  };

  verifyEmail: Controller = async (req, res) => {
    const { email, token } = req.params as IParams["verifyEmail"];
    if (email === undefined) {
      return await res.status(400).send("Parâmetro 'email' está vazio.");
    }

    if (token === undefined) {
      return await res.status(400).send("Parâmetro 'token' está vazio.");
    }

    try {
      const user = await userServices.getOne(email);

      if (user === undefined) {
        return await res.status(404).send("Usuário não encontrado.");
      }

      if (user.verify_email_token === null || user.verify_email_token_expiration === null) {
        return await res.status(400).send("Usuário com o email já verificado.");
      }

      const now = new Date();
      const tokenExpiration = new Date(user.verify_email_token_expiration as string);

      if (now > tokenExpiration) {
        await userServices.delete(user);

        return await res.status(400).send("O token de validação de email expirou, crie sua conta novamente.");
      }

      if (token !== user.verify_email_token) {
        return await res.status(400).send("Token inválido.");
      }

      await userServices.verifyEmail(email, token);

      user.is_active = 1;
      delete user.verify_email_token;
      delete user.verify_email_token_expiration;

      await res.status(200).send({ user: { ...user, teams: user.teams?.split(",") } });
    } catch (err) {
      console.log(err);
      await res.status(500).send("Erro no processamento interno ao tentar verificar o email do usuário.");
    }
  };

  updateTeams: Controller = async (req, res) => {
    const { email, newTeams } = req.body as IBody["updateTeams"];
    if (email === undefined || email === null) {
      return await res.status(400).send("O campo 'email' está faltando na requisição.");
    }

    if (newTeams === undefined || newTeams === null) {
      return await res.status(400).send("O campo 'novo(s) time(s)' está faltando na requisição.");
    }

    if (newTeams.split(",").length > 3) {
      return await res.status(400).send("Você só pode acompanhar até três times!");
    }

    try {
      const user = await userServices.getOne(email);

      if (user === undefined) {
        return await res.status(404).send("Usuário não encontrado.");
      }

      await userServices.updateTeams(newTeams, user);

      await res.status(201).send(`Seus times foram atualizados com sucesso.`);
    } catch (err) {
      console.log(err);
      await res.status(500).send("Erro no processamento interno ao tentar atualizar os times do usuário.");
    }
  };

  delete: Controller = async (req, res) => {
    const { email } = req.params as IParams["delete"];
    if (email === undefined) {
      return await res.status(400).send("Parâmetro 'email' está vazio.");
    }

    try {
      const user = await userServices.getOne(email);

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
