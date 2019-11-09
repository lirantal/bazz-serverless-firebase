"use strict";

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const uuid = require("uuid");

admin.initializeApp(functions.config().firebase);
let db = admin.firestore();

const LoggerService = require("./Utils/Logger");
const Logger = new LoggerService();

const STATUS = {
  NEW: "new",
  APPROVED: "approved"
};

class SubscriptionsRepository {
  static async getPendingApproval(data) {
    const subscriptionsRef = db.collection("subscriptions");
    const queryRef = subscriptionsRef.doc(data.sub_id);
    const item = await queryRef.get();

    if (!item.exists) {
      throw new Error(`Not found subscription id: ${data.sub_id}`);
    }

    const itemData = item.data();
    if (itemData.nonce === data.nonce && itemData.status === STATUS.NEW) {
      return itemData;
    } else {
      return null;
    }
  }

  static async reserveSubscription(token) {
    const id = uuid.v1();
    const nonce = uuid.v4();

    let subscriptionRef = db.collection("subscriptions").doc(id);

    Logger.log.info("Creating subscription data:");
    const subscriptionData = {
      id: id,
      nonce: nonce,
      token: token,
      status: STATUS.NEW,
      createdAt: new Date().toISOString()
    };
    Logger.log.info(subscriptionData);

    await subscriptionRef.set(subscriptionData);
    return subscriptionData;
  }

  static async getByToken(token, options) {
    let subscriptionsRef = db.collection("subscriptions");
    let queryRef = subscriptionsRef.where("token", "==", token);

    if (options && options.approved === true) {
      queryRef.where("status", "==", STATUS.APPROVED);
    }

    const snapshot = await queryRef.limit(1).get();
    if (snapshot.empty) {
      Logger.log.info(`Unable to find token: ${token}`);
      return null;
    }

    Logger.log.info("Subscription data is:");
    let subscriptionSnapshot = {};
    snapshot.forEach(doc => {
      Logger.log.info(`${doc.id} - ${JSON.stringify(doc.data())}`);
      subscriptionSnapshot.id = doc.id;
      subscriptionSnapshot.data = doc.data();
    });

    return subscriptionSnapshot;
  }
}

module.exports = SubscriptionsRepository;
