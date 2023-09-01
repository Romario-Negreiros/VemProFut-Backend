import dotenv from "dotenv";

dotenv.config();

const env = {
  dbHost: process.env.DB_HOST as string,
  dbPassword: process.env.DB_PASSWORD as string,
  zohomailUser: process.env.ZOHOMAIL_USER as string,
  zohomailPass: process.env.ZOHOMAIL_PASS as string,
  appSecret: process.env.APP_SECRET as string,
};

export default env;
