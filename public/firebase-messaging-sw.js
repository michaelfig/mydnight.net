
self.addEventListener('fetch', function(event) {
  // Don't do any caching.
  // TODO: We may want to eventually.
  event.respondWith(fetch(event.request).catch());
});

importScripts("https://www.gstatic.com/firebasejs/5.9.4/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/5.9.4/firebase-messaging.js");
firebase.initializeApp({
	// Project Settings => Add Firebase to your web app
  messagingSenderId: "513832891425"
});
const messaging = firebase.messaging();
self.addEventListener('notificationclick', e => {
  let found = false;
  const click_action = e.notification.data && e.notification.data.click_action;
  if (!click_action) {
    return;
  }
  let f = clients.matchAll({
      type: 'window'
  })
      .then(function (clientList) {
          for (let i = 0; i < clientList.length; i ++) {
              if (click_action === '/' || clientList[i].url.endsWith(click_action)) {
                  // We already have a window to use, focus it.
                  found = true;
                  clientList[i].focus();
                  break;
              }
          }
          if (! found) {
              clients.openWindow(click_action).then(function (windowClient) {});
          }
      });
  e.notification.close();
  e.waitUntil(f);
});

messaging.setBackgroundMessageHandler(function (payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here

  return self.registration.showNotification(payload.data.title,
      Object.assign({data: payload.data}, payload.data));

});
