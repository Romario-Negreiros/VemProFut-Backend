import dotenv from "dotenv";
dotenv.config();

export default {
  host: "smtp.zoho.com",
  port: 465,
  secure: true,
  user: process.env.ZOHOMAIL_USER,
  pass: process.env.ZOHOMAIL_PASS,
};
