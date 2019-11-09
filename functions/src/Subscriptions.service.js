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
    if (
      !subscriptionObject ||
      !subscriptionObject.endpoint ||
      !subscriptionObject.endpoint.length ||
      !subscriptionObject.keys ||
      !data.sub_id ||
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
}

module.exports = Subscriptions;
