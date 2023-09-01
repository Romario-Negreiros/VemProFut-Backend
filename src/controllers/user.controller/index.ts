import app from "../../app";
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
      return await res.status(400).send({ error: "Parâmetro 'email' está vazio." });
    }

    try {
      const user = await userServices.getOne(email);

      if (user === undefined) {
        return await res.status(404).send({ error: "Usuário não encontrado." });
      }

      await res.status(200).send({ user });
    } catch (err) {
      console.log(err);
      await res.status(500).send({ error: "Erro no processamento interno ao tentar buscar o usuário." });
    }
  };

  register: Controller = async (req, res) => {
    const { name, email, password, teams } = req.body as IBody["register"];
    if (name === undefined || name === null) {
      return await res.status(400).send({ error: "O campo 'nome' está faltando na requisição." });
    }

    if (email === undefined || email === null) {
      return await res.status(400).send({ error: "O campo 'email' está faltando na requisição." });
    }

    if (password === undefined || password === null) {
      return await res.status(400).send({ error: "O campo 'senha' está faltando na requisição." });
    }

    if (teams !== undefined && teams?.split(",").length > 3) {
      return await res.status(400).send({ error: "Você só pode acompanhar até três times!" });
    }

    try {
      const verifyEmailToken = crypto.randomBytes(10).toString("hex");
      const verifyEmailTokenExpiration = new Date();
      verifyEmailTokenExpiration.setHours(verifyEmailTokenExpiration.getHours() + 1);

      await userServices.register(verifyEmailToken, verifyEmailTokenExpiration.toISOString(), name, email, password, teams);

      await res
        .status(201)
        .send({
        success:  `Você foi registrado com sucesso, ${name}. Verifique seu email para começar a receber as notificações semanais.`,
      });
    } catch (err) {
      console.log(err);
      const error = err as QueryError;
      if (error.errno === 1062) {
        return await res.status(400).send({ error: "O usuário já está registrado." });
      }

      await res.status(500).send({ error: "Erro no processamento interno ao tentar registrar o usuário." });
    }
  };

  verifyEmail: Controller = async (req, res) => {
    const { email, token } = req.params as IParams["verifyEmail"];
    if (email === undefined) {
      return await res.status(400).send({ error: "Parâmetro 'email' está vazio." });
    }

    if (token === undefined) {
      return await res.status(400).send({ error: "Parâmetro 'token' está vazio." });
    }

    try {
      const user = await userServices.getOne(email);

      if (user === undefined) {
        return await res.status(404).send({ error: "Usuário não encontrado." });
      }

      if (user.verifyEmailToken === null || user.verifyEmailTokenExpiration === null) {
        return await res.status(400).send({ error: "Usuário com o email já verificado." });
      }

      const now = new Date();
      const tokenExpiration = new Date(user.verifyEmailTokenExpiration as string);

      if (now > tokenExpiration) {
        await userServices.delete(user);

        return await res.status(400).send({ error: "O token de validação de email expirou, crie sua conta novamente." });
      }

      if (token !== user.verifyEmailToken) {
        await userServices.delete(user);

        return await res.status(400).send({ error: "Token inválido, crie sua conta novamente." });
      }

      await userServices.verifyEmail(email, token);

      user.isActive = 1;
      delete user.verifyEmailToken;
      delete user.verifyEmailTokenExpiration;
      delete user.password;

      const jwt = app.fastify.jwt.sign(user, { expiresIn: 86400 });

      await res.status(200).send({ user, jwt });
    } catch (err) {
      console.log(err);
      await res.status(500).send({ error: "Erro no processamento interno ao tentar verificar o email do usuário." });
    }
  };

  updateTeams: Controller = async (req, res) => {
    const { email, newTeams } = req.body as IBody["updateTeams"];
    if (email === undefined || email === null) {
      return await res.status(400).send({ error: "O campo 'email' está faltando na requisição." });
    }

    if (newTeams === undefined || newTeams === null) {
      return await res.status(400).send({ error: "O campo 'novo(s) time(s)' está faltando na requisição." });
    }

    if (newTeams.split(",").length > 3) {
      return await res.status(400).send({ error: "Você só pode acompanhar até três times!" });
    }

    try {
      const user = await userServices.getOne(email);

      if (user === undefined) {
        return await res.status(404).send({ error: "Usuário não encontrado." });
      }

      await userServices.updateTeams(newTeams, user);

      await res.status(201).send({ success: `Seus times foram atualizados com sucesso.` });
    } catch (err) {
      console.log(err);
      await res.status(500).send({ error: "Erro no processamento interno ao tentar atualizar os times do usuário." });
    }
  };

  delete: Controller = async (req, res) => {
    const { email } = req.params as IParams["delete"];
    if (email === undefined) {
      return await res.status(400).send({ error: "Parâmetro 'email' está vazio." });
    }

    try {
      const user = await userServices.getOne(email);

      if (user === undefined) {
        return await res.status(404).send({ error: "Usuário não encontrado." });
      }

      await userServices.delete(user);

      await res.status(200).send({ success: "Usuário deletado com sucesso." });
    } catch (err) {
      console.log(err);
      await res.status(500).send({ error: "Erro no processamento interno ao tentar deletar o usuário." });
    }
  };
}

export default new UserController();
