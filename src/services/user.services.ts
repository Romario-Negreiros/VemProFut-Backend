import connection from "../app/db";

import type User from "../models/user.model";

interface IUserServices {
  getOne: (email: string) => Promise<User>;
}

class UserServices implements IUserServices {
  getOne = async (email: string): Promise<User> => {
    return await new Promise((resolve, reject) => {
      connection.query<User[]>("SELECT * FROM users WHERE email=?", [email], (err, results) => {
        if (err !== null) {
          reject(err);
        } else {
          resolve(results?.[0]);
        }
      });
    });
  };
}

export default new UserServices();
