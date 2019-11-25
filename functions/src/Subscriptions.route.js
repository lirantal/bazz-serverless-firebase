"use strict";

const functions = require("firebase-functions");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const HttpResponse = require("boom");

const SubscriptionsService = require("./Subscriptions.service");
const LoggerService = require("./Utils/Logger");
const Logger = new LoggerService();

const app = express();
app.use(bodyParser.json());
app.use(cors({ origin: true }));

app.get("/api/subscriptions", async (req, res) => {
  try {
    const subscriptionsService = new SubscriptionsService();

    let token = "";
    token = req.get("authorization");
    if (!token) {
      throw HttpResponse.unauthorized("No token found");
    }

    const subscriptionItem = await subscriptionsService.getByToken(token);

    const responseData = {
      data: subscriptionItem
    };

    return res.status(200).json(responseData);
  } catch (error) {
    // @TODO error message
    Logger.log.info(error);
    return res.status(500).json(HttpResponse.badImplementation(error));
  }
});

app.post("/api/subscriptions", async (req, res) => {
  try {
    const subscriptionsService = new SubscriptionsService();

    Logger.log.info("Creating a subscription from the request payload:");
    Logger.log.info(req.body);
    await subscriptionsService.create(req.body);

    return res.status(201).json({
      statusCode: 201,
      data: {
        success: true
      }
    });
  } catch (error) {
    // @TODO error message
    Logger.log.info(error);
    return res.status(500).json(HttpResponse.badImplementation(error));
  }
});

app.post("/api/subscriptions/:id/confirmations", async (req, res) => {
  Logger.log.info("Confirming subscription");
  try {
    const subscriptionsService = new SubscriptionsService();

    let data = {};
    try {
      data = {
        token: req.get("authorization"),
        sub_id: req.params.id,
        nonce: req.body.nonce
      };
    } catch (error) {
      throw HttpResponse.badRequest("Missing or incorrect data");
    }

    const subscriptionConfirmedStatus = await subscriptionsService.confirmSubscription(
      data
    );

    if (subscriptionConfirmedStatus !== true) {
      throw new Error("Unable to confirm subscription");
    }

    return res.status(200).json({
      statusCode: 200,
      data: {
        success: true
      }
    });
  } catch (error) {
    // @TODO error message
    Logger.log.info(error);
    return res.status(500).json(HttpResponse.badImplementation(error));
  }
});

app.get("/api/subscriptions/pending", async (req, res) => {
  try {
    const subscriptionsService = new SubscriptionsService();

    let data = {};
    try {
      data = {
        token: req.get("authorization"),
        sub_id: req.query["sub_id"],
        nonce: req.query["nonce"]
      };
    } catch (error) {
      throw HttpResponse.badRequest("Missing or incorrect data");
    }

    const subscriptionItem = await subscriptionsService.getPendingApproval(
      data
    );
    const responseData = {
      data: subscriptionItem
    };

    return res.status(200).json(responseData);
  } catch (error) {
    // @TODO wrap this error into a proper error message that will return back
    // the message itself without the stack trace
    Logger.log.info(error);
    return res.status(500).json(HttpResponse.badImplementation(error));
  }
});

module.exports = app;
