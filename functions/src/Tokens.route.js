"use strict";

const functions = require("firebase-functions");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const HttpResponse = require("boom");

const TokensService = require("./Tokens.service");
const SubscriptionsService = require("./Subscriptions.service");
const LoggerService = require("./Utils/Logger");
const Logger = new LoggerService();

const app = express();
app.use(bodyParser.json());
app.use(cors({ origin: true }));

/**
 * Semi-Signup - Creates a token for the user
 */
app.post("/api/tokens", async (req, res) => {
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

app.post("/api/tokens/notifications", async (req, res) => {
  Logger.log.info("Trigger notification for subscription");
  try {
    const subscriptionsService = new SubscriptionsService();

    let token = "";
    token = req.get("authorization");
    if (!token) {
      throw HttpResponse.unauthorized("No token found");
    }

    await subscriptionsService.triggerSubscriptionNotification(token);

    return res.status(200).json({
      statusCode: 200,
      data: {
        success: true
      }
    });
  } catch (error) {
    Logger.log.info(error.message);
    return res
      .status(500)
      .json(HttpResponse.notImplemented("Unable to trigger notifications"));
  }
});

module.exports = app;
