import env from "./env.config";

export default {
  host: "smtp.zoho.com",
  port: 465,
  secure: true,
  user: env.zohomailUser,
  pass: env.zohomailPass,
};
