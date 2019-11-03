"use strict";

const crypto = require("crypto");

const LoggerService = require("./Utils/Logger");
const Logger = new LoggerService();

class Token {
  constructor() {
    this.tokenBytes = 48;
  }

  async create() {
    const token = await this.generateApiToken();
    Logger.log.info(`generated api token: ${token}`);

    return token;
  }

  generateApiToken() {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(this.tokenBytes, (err, buffer) => {
        if (err) {
          return reject(err);
        }

        return resolve(buffer.toString("hex"));
      });
    });
  }
}

module.exports = Token;
