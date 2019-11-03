"use strict";

const pino = require("pino");

class Logger {
  constructor(options = {}) {
    const tags = options && options.tags ? options.tags : ["dev"];
    const appName = options && options.appName ? options.appName : "";
    const level = options && options.level ? options.level : "trace";

    this.logger = pino({
      name: appName,
      level: level
    });
    this.log = this.logger.child({ tags });
  }

  extendWithMeta(options = {}) {
    const event = options && options.meta && options.meta.event;
    const context = options && options.meta && options.meta.context;

    this.log = this.log.child({ event, context });
  }
}

module.exports = Logger;
