"use strict";

const crypto = require("crypto");
const HttpResponse = require("boom");

const subscriptionsRepository = require("./SubscriptionsRepository");

const LoggerService = require("./Utils/Logger");
const Logger = new LoggerService();

class Token {
  constructor() {
    this.tokenBytes = 48;
  }

  async create() {
    const token = await this.generateApiToken();

    Logger.log.info(`Generated api token: ${token}`);

    // check if a subscription by this token exists already
    // if it does, we abort, otherwise provide back the token
    const data = await subscriptionsRepository.getByToken(token);

    if (data !== null) {
      throw HttpResponse.notImplemented("Unable to create token");
    }

    Logger.log.info("Reserving subscription");
    let subscription = await subscriptionsRepository.reserveSubscription(token);
    return subscription;
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
