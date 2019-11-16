"use strict";

const subscriptionsRepository = require("./SubscriptionsRepository");
const webpush = require("web-push");
const LoggerService = require("./Utils/Logger");
const Logger = new LoggerService();

class Subscriptions {
  constructor() {
    const vapidKeys = {
      publicKey: process.env.WEB_PUSH_PUBKEY,
      privateKey: process.env.WEB_PUSH_PRVKEY
    };

    webpush.setVapidDetails(
      "mailto:noreply@example.com",
      vapidKeys.publicKey,
      vapidKeys.privateKey
    );
  }

  /**
   *
   * @param {*} data
   */
  async isValid(data) {
    Logger.log.info("Checking subscription object validity");

    // A valid subscription object should at least has a URL endpoint defined
    const subscriptionObject = data && data.subscription;
    data.id = data.id ? data.id : data.sub_id;
    if (
      !subscriptionObject ||
      !subscriptionObject.endpoint ||
      !subscriptionObject.endpoint.length ||
      !subscriptionObject.keys ||
      !data.id ||
      !data.nonce ||
      typeof subscriptionObject.endpoint !== "string"
    ) {
      throw new Error("Invalid subscription object");
    }

    return true;
  }

  async getPendingApproval(data) {
    if (!data || !data.token || !data.sub_id || !data.nonce) {
      throw new Error("Missing token, subscription id or nonce");
    }

    Logger.log.info("Checking a pending approval subscription");
    Logger.log.debug(data);

    const subscriptionItem = await subscriptionsRepository.getPendingApproval(
      data
    );

    if (!subscriptionItem) {
      throw new Error("No pending token exists");
    }

    if (subscriptionItem.token !== data.token) {
      throw new Error("Subscription not found");
    }

    const isSubscriptionValid = await this.isValid(subscriptionItem);
    if (!isSubscriptionValid) {
      throw new Error("Subscription not found");
    }

    return {
      id: subscriptionItem.id,
      valid: true
    };
  }

  async getByToken(token) {
    if (!token) {
      throw new ApiError.unauthorized("No token found");
    }

    const subscriptionItem = await subscriptionsRepository.getByToken(token, {
      approved: true
    });

    if (!subscriptionItem) {
      throw new Error("No subscription found for token");
    }

    Logger.log.info("Found subscription:");
    Logger.log.info(subscriptionItem);

    return {
      id: subscriptionItem.id,
      status: subscriptionItem.status,
      createdAt: subscriptionItem.createdAt,
      updatedAt: subscriptionItem.updatedAt
    };
  }

  async confirmSubscription(data) {
    const subscription = {
      token: String(data.token),
      sub_id: String(data.sub_id),
      nonce: String(data.nonce)
    };

    const subscriptionItem = await this.getPendingApproval(subscription);
    if (subscriptionItem.id && subscriptionItem.valid === true) {
      await subscriptionsRepository.confirmSubscription(subscriptionItem);
    } else {
      throw new Error("Invalid confirmation request");
    }

    return true;
  }

  async create(data) {
    const isSubscriptionValid = await this.isValid(data);
    if (!isSubscriptionValid) {
      throw new Error("Subscription not found");
    }

    const subscriptionItem = {
      subscription: {
        endpoint: String(data.subscription.endpoint),
        keys: data.subscription.keys
      },
      sub_id: String(data.sub_id),
      nonce: String(data.nonce)
    };

    await subscriptionsRepository.updateSubscription(subscriptionItem);
    return true;
  }

  updateSubscriptionNotified(sub) {
    return subscriptionsRepository.setSubscriptionNotified(sub);
  }

  triggerPushMsg(subscription) {
    return webpush.sendNotification(subscription);
  }

  async triggerSubscriptionNotification(token) {
    if (!token) {
      throw new Error("No token found");
    }

    const subscriptionItem = await subscriptionsRepository.getByToken(token, {
      approved: true
    });

    Logger.log.info("Retrieved subscription by token");
    Logger.log.info(subscriptionItem);

    // @FIXME also consider if we actually want to limit it? or just
    // to have a flag whether it was ever notified or not
    if (
      subscriptionItem &&
      subscriptionItem.notified &&
      subscriptionItem.notified === true
    ) {
      throw new Error("Subscription token already notified");
    }

    if (!subscriptionItem.subscription.endpoint) {
      throw new Error("Malformed subscription object");
    }

    Logger.log.info("Triggering push notification for subscription:");
    Logger.log.info(subscriptionItem);
    await this.triggerPushMsg(subscriptionItem.subscription);

    Logger.log.info("Update subscription notification as notified");
    await this.updateSubscriptionNotified(subscriptionItem);
  }

  async setSubscriptionNotified(subscription) {
    const subscriptionRef = db.collection("subscriptions");
    const queryRef = subscriptionRef.doc(subscription.id);

    await queryRef.set(
      {
        notified: true,
        updatedAt: new Date().toISOString()
      },
      { merge: true }
    );
  }
}

module.exports = Subscriptions;
