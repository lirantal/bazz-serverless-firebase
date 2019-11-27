import {urlBase64ToUint8Array} from './util'

const apiBasePath = process.env.REACT_APP_API_BASE_PATH || ''

let subscriptionUrl
if (apiBasePath) {
  subscriptionUrl = `${apiBasePath}/subscriptions`
} else {
  subscriptionUrl = `/api/subscriptions`
}

/**
 * Prompt the user for notification permission on the browser
 */
export function requestNotificationPermission() {
  return new Promise((resolve, reject) => {
    // support for older browsers/spec where requestPermission was
    // using a callback
    const permission = Notification.requestPermission(result => {
      return resolve(result)
    })

    // handle newer spec which returns a promise
    if (permission) {
      return permission.then(resolve, reject)
    }
  }).then(result => {
    if (result !== 'granted') {
      throw new Error('Notification permission denied')
    }
  })
}

/**
 * Checks whether we have all the capabilities in browser,
 * including permissions, to continue with the app flow
 */
export function checkBrowerCapabilities() {
  if (Notification.permission === 'denied') {
    return Promise.resolve({allowed: false, reason: 'blocked'})
  }

  // feature detect for push support in browser
  if (!('PushManager' in window)) {
    return Promise.resolve({allowed: false, reason: 'unsupported'})
  }

  // feature detect with sw
  return navigator.serviceWorker.ready.then(registration => {
    if (!registration.pushManager) {
      return {
        allowed: false,
        reason: 'unsupported'
      }
    } else {
      return {
        allowed: true
      }
    }
  })
}

/**
 * Get a browser's push subscription
 */
export function getSubscription() {
  return navigator.serviceWorker.ready.then(registration => {
    return registration.pushManager.getSubscription()
  })
}

/**
 * Request a push subscription from push server
 */
export function subscribePush() {
  return navigator.serviceWorker.ready.then(registration => {
    if (!registration.pushManager) {
      throw new Error({
        allowed: false,
        reason: 'unsupported'
      })
    }

    // To subscribe `push notification` from push manager
    // when we subscribe, if there's no Notification permission granted before it will be popped up
    // by calling subscribe already. It might be redundant, depending on the site's UX
    return registration.pushManager.subscribe({
      // current spec requires that we always send out a visible push message
      userVisibleOnly: true,
      // this is required by the push service to authenticate the push message to the user
      // create a private/public key pair using: npm install -g web-push && web-push generate-vapid-keys
      // you register with the application public key here and on your own service you send out push messages
      // to the endpoint with an Authorization header that is signed with your own service's private key
      // @TODO also instead of hard-coding it we can query the server and ask for it
      applicationServerKey: urlBase64ToUint8Array(
        'BEo88fXNfsMRFlmISNJD_N68AyvvVGygIco8EzsIGKV9O5EXG1dkY6AB2Ifo9fURKRpSSwJC2vO-88gdtQNW6TE'
      )
    })
  })
}

/**
 * Send the subscription request to the application server
 *
 * @param {object} subscription
 * @param {string} token
 */
export function sendSubscription(subscription, tokenData) {
  const data = {
    subscription,
    sub_id: tokenData.sub_id,
    nonce: tokenData.nonce
  }

  return fetch(subscriptionUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Application server error')
      }

      return response.json()
    })
    .then(responseData => {
      // this response structure is mandated by the spec for push server clients
      if (!(responseData.data && responseData.data.success)) {
        throw new Error('Application server response structure error')
      }
    })
    .then(() => {
      return subscription
    })
}
