import dotenv from "dotenv";
dotenv.config();

export default {
  HOST: process.env.DB_HOST, // change with hosting service url later
  USER: "root",
  PASSWORD: process.env.DB_PWD,
  DB: "VemProFut",
};
