import env from "./env.config";

export default {
  HOST: env.dbHost, // change with hosting service url later
  USER: env.dbUser,
  PASSWORD: env.dbPassword,
  DB: env.dbName,
};
