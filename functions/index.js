"use strict";

const functions = require("firebase-functions");

const tokensRoute = require("./src/Tokens.route");
const subscriptionsRoute = require("./src/Subscriptions.route");

exports.tokens = functions.https.onRequest(tokensRoute);
exports.subscriptions = functions.https.onRequest(subscriptionsRoute);
