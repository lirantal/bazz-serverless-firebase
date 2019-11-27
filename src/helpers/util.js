/**
 * Get application server token
 */
export function getToken() {
  const params = getQueryParams()
  if (params && params.sub_id && params.nonce) {
    return {
      sub_id: params.sub_id,
      nonce: params.nonce
    }
  }
}

/**
 * Create a hash-map representation of key/values in query string
 */
export function getQueryParams() {
  const queryString = window.location.search
  const queryParams = queryString.slice(queryString.indexOf('?') + 1)
  return queryParams.split('&').reduce((accum, curr) => {
    const [key, value] = curr.split('=')
    accum[key] = value
    return accum
  }, {})
}

/**
 * Convert a Base64 URL string to unsigned int array
 * as expected by push server's spec
 * @see https://www.npmjs.com/package/web-push
 */
export function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }

  return outputArray
}
