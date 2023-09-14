import type { FastifyRequest, FastifyReply } from "fastify";

const jwtPlugin = async (req: FastifyRequest, res: FastifyReply) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return await res.status(401).send({ error: "Token de autenticação não fornecido." });
  }

  const parts = authHeader.split(" ");

  if (parts.length !== 2) {
    return await res.status(401).send({ error: "Token de autenticação mal-formatado." });
  }

  if (/^Bearer [a-z09.,-]*$/i.test(authHeader)) {
    return await res.status(401).send({ error: "Token de autenticação mal-formatado." });
  }

  try {
    await req.jwtVerify({ maxAge: 86400 });
  } catch (error) {
    console.log(error);
    await res.status(401).send({ error: "Token inválido" });
  }
};

export default jwtPlugin;
