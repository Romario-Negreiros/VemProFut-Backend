import mysql from "mysql2/promise";
import dbConfig from "../config/db.config";

const createDatabaseConnection = async () => {
  return await mysql.createConnection({
    host: dbConfig.HOST,
    user: dbConfig.USER,
    password: dbConfig.PASSWORD,
    database: dbConfig.DB,
  });
};

export default createDatabaseConnection;
