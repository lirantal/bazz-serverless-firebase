"use strict";

const functions = require("firebase-functions");
const tokensRoute = require("./src/Tokens.route");
exports.tokens = functions.https.onRequest(tokensRoute);
