"use strict";

const functions = require("firebase-functions");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const ApiError = require("boom");

const TokensService = require("./Tokens.service");
const LoggerService = require("./Utils/Logger");
const Logger = new LoggerService();

const app = express();
app.use(bodyParser.json());
app.use(cors({ origin: true }));

/**
 * Semi-Signup - Creates a token for the user
 */
app.get("/", async (req, res) => {
  try {
    const tokenService = new TokensService();
    const token = await tokenService.create();
    res.status(201).send(token);
  } catch (error) {
    Logger.log.error(error.message);
    res.status(500).send(new ApiError.notImplemented("Unable to create token"));
  }
});

module.exports = app;
