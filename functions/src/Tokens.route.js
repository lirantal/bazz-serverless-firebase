"use strict";

const functions = require("firebase-functions");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const HttpResponse = require("boom");

const TokensService = require("./Tokens.service");
const LoggerService = require("./Utils/Logger");
const Logger = new LoggerService();

const app = express();
app.use(bodyParser.json());
app.use(cors({ origin: true }));

/**
 * Semi-Signup - Creates a token for the user
 */
app.post("/", async (req, res) => {
  try {
    const tokenService = new TokensService();
    const subscription = await tokenService.create();
    Logger.log.info("Successfully created subscription token");

    const responseData = {
      data: {
        sub_id: subscription.id,
        token: subscription.token,
        nonce: subscription.nonce
      }
    };

    // TODO wrap properly in named HTTP responses
    return res.status(201).json(responseData);
  } catch (error) {
    Logger.log.info(error.message);
    return res
      .status(500)
      .json(HttpResponse.notImplemented("Unable to create token"));
  }
});

module.exports = app;
