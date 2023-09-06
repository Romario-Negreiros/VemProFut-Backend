import app from "../../app";
import userServices from "../../services/user.services";
import crypto from "crypto";
import bcrypt from "bcryptjs";

import type { Controller, IUserController, RequestParams, RequestBody } from "./types";
import type { QueryError } from "mysql2";
import type User from "../../models/user.model";

// req = request
// res = response

class UserController implements IUserController {
  signUp: Controller = async (req, res) => {
    const { name, email, password, teams } = req.body as RequestBody;
    let wasCreated = false;

    if (name === undefined || name === null) {
      return await res.status(400).send({ error: "O campo 'nome' está faltando na requisição." });
    }

    if (email === undefined || email === null) {
      return await res.status(400).send({ error: "O campo 'email' está faltando na requisição." });
    }

    if (password === undefined || password === null) {
      return await res.status(400).send({ error: "O campo 'senha' está faltando na requisição." });
    }

    if (teams !== undefined && teams.length > 3) {
      return await res.status(400).send({ error: "Você só pode acompanhar até três times!" });
    }

    try {
      const verifyEmailToken = crypto.randomBytes(10).toString("hex");
      const verifyEmailTokenExpiration = new Date();
      verifyEmailTokenExpiration.setHours(verifyEmailTokenExpiration.getHours() + 1);

      const hashedPassword = await bcrypt.hash(password, 15);

      await userServices.create(
        name,
        email,
        hashedPassword,
        verifyEmailToken,
        verifyEmailTokenExpiration.toISOString(),
        teams,
      );
      wasCreated = true;

      await app.mailer.send({
        to: email,
        subject: "Verify your email address",
        templateName: "verify-email",
        templateVars: {
          name,
          email,
          token: verifyEmailToken,
        },
      });

      await res.status(201).send({
        success: `Você foi registrado com sucesso, ${name}. Verifique seu email para começar a receber as notificações semanais.`,
      });
    } catch (err) {
      console.log(err);

      if (wasCreated) {
        await userServices.delete(email);
      }

      const error = err as QueryError;
      if (error.errno === 1062) {
        return await res.status(400).send({ error: "O usuário já está registrado." });
      }

      await res.status(500).send({ error: "Erro no processamento interno ao tentar registrar o usuário." });
    }
  };

  signIn: Controller = async (req, res) => {
    const { email, password } = req.body as RequestBody;

    if (email === undefined || email === null) {
      return await res.status(400).send({ error: "O campo 'email' está faltando na requisição." });
    }

    if (password === undefined || password === null) {
      return await res.status(400).send({ error: "O campo 'senha' está faltando na requisição." });
    }

    try {
      let user = await userServices.get(email, ["password"]);
      if (!user) {
        return await res.status(404).send({ error: "Usuário não encontrado, o email inserido pode estar incorreto." })
      }

      const isPasswordCorrect = await bcrypt.compare(password, user?.password as string);
      if (!isPasswordCorrect) {
        return await res.status(401).send({ error: "A senha inserida não coincide com a do usuário." });
      }

      user = await userServices.get(email);
      delete user?.verifyEmailToken;
      delete user?.verifyEmailTokenExpiration;
      delete user?.password;

      const jwt = app.fastify.jwt.sign(user as User, { expiresIn: 86400 });

      await res.status(200).send({ user, jwt });
    } catch (error) {
      console.log(error);
      await res.status(500).send({ error: "Erro no processamento interno ao tentar iniciar sessão do usuário." })
    }
  };

  verifyEmail: Controller = async (req, res) => {
    const { email, token } = req.params as RequestParams;
    if (email === undefined) {
      return await res.status(400).send({ error: "Parâmetro 'email' está vazio." });
    }

    if (token === undefined) {
      return await res.status(400).send({ error: "Parâmetro 'token' está vazio." });
    }

    try {
      const user = await userServices.get(email);

      if (user === undefined) {
        return await res.status(404).send({ error: "Usuário não encontrado." });
      }

      if (user.verifyEmailToken === null || user.verifyEmailTokenExpiration === null) {
        return await res.status(400).send({ error: "Usuário com o email já verificado." });
      }

      const now = new Date();
      const tokenExpiration = new Date(user.verifyEmailTokenExpiration as string);

      if (now > tokenExpiration) {
        await userServices.delete(email);

        return await res
          .status(400)
          .send({ error: "O token de validação de email expirou, crie sua conta novamente." });
      }

      if (token !== user.verifyEmailToken) {
        await userServices.delete(email);

        return await res.status(400).send({ error: "Token inválido, crie sua conta novamente." });
      }

      await userServices.update(
        email,
        {
          isActive: 1,
          verifyEmailToken: null,
          verifyEmailTokenExpiration: null,
        },
        {
          email,
        },
        "and",
      );

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

  update: Controller = async (req, res) => {
    const body = req.body as RequestBody
    if (!body.password) {
      return await res.status(400).send({ error: "O campo 'senha' está faltando na requisição." });
    }
    
    try {
      const { email, teams } = req.user.valueOf() as User;
      console.log(email);
      const { userTeams } = body;
      if (userTeams && teams) {
        if (((teams?.length - userTeams?.teamsToRemove.length) + userTeams?.teamsToAdd.length) > 3) {
          return await res.status(400).send({ error: "Você só pode acompanhar até três times!" });
        }
      }

      const user = await userServices.get(email as string, ["password"]); // refactor userServices.get
      const isPasswordCorrect = await bcrypt.compare(body.password, user?.password as string);
      if (!isPasswordCorrect) {
        return await res.status(401).send({ error: "A senha inserida não coincide com a do usuário." });
      }

      delete body.password;
      delete body.userTeams;
      delete body.teams;
      await userServices.update(email as string, body, { email }, undefined, userTeams);

      await res.status(201).send({ success: `Seus times foram atualizados com sucesso.` });
    } catch (err) {
      console.log(err);
      await res.status(500).send({ error: "Erro no processamento interno ao tentar atualizar os dados do usuário." });
    }
  };

  delete: Controller = async (req, res) => {
    const { email } = req.params as RequestParams;
    if (email === undefined) {
      return await res.status(400).send({ error: "Parâmetro 'email' está vazio." });
    }

    try {
      await userServices.delete(email);

      await res.status(200).send({ success: "Usuário deletado com sucesso." });
    } catch (err) {
      console.log(err);
      await res.status(500).send({ error: "Erro no processamento interno ao tentar deletar o usuário." });
    }
  };
}

export default new UserController();
