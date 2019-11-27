;(function() {
  self.addEventListener('push', event => {
    /**
     * a push notification can contain rich metadata
     * such as a custom message from the application server
     * which we are able to utilize for a custom notification
     * message
    if (event && event.data) {
      // do something with event.data.text() 
    }
    */

    const title = 'Bazz up!'
    event.waitUntil(self.registration.showNotification(title))
  })
})()
