import nodemailer from "nodemailer";
import fs from "fs";
import ejs from "ejs";
import juice from "juice";

import mailerConfig from "../config/mailer.config";
import env from "../config/env.config";

import type { SendMailOptions } from "nodemailer";

type TemplateNames = "verify-email";

interface VerifyEmailTemplateVars {
  name: string;
  email: string;
  token: string;
}

type TemplateVars = VerifyEmailTemplateVars;

interface MailOptions extends SendMailOptions {
  templateName: TemplateNames;
  templateVars: TemplateVars;
}

interface IMailer {
  send: (options: MailOptions) => Promise<void>;
}

const transport = nodemailer.createTransport({
  host: mailerConfig.host,
  port: mailerConfig.port,
  secure: mailerConfig.secure,
  auth: {
    user: mailerConfig.user,
    pass: mailerConfig.pass,
  },
});

class Mailer implements IMailer {
  send = async (options: MailOptions): Promise<void> => {
    const templatePath = `public/templates/${options.templateName}.html`;
    if (fs.existsSync(templatePath)) {
      const template = fs.readFileSync(templatePath, "utf-8");
      const html = juice(ejs.render(template, options.templateVars));

      await transport.sendMail({
        from: env.zohomailUser,
        to: options.to,
        subject: options.subject,
        html,
      });
    }
  };
}

export default new Mailer();
