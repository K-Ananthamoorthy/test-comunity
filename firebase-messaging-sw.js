importScripts('https://www.gstatic.com/firebasejs/8.5.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.5.0/firebase-messaging.js');

// Initialize Firebase
firebase.initializeApp({
  apiKey: "AIzaSyCN0VLc3wYAeKBk06g-HVtE4dDPcEZo6xk",
    authDomain: "aiml-smvitm.firebaseapp.com",
    projectId: "aiml-smvitm",
    storageBucket: "aiml-smvitm.appspot.com",
    messagingSenderId: "867145474581",
    appId: "1:867145474581:web:a2e294081b458bdb69e41c",
    measurementId: "G-64CF103MLC"
});

const messaging = firebase.messaging();

// Customize notification handler
messaging.setBackgroundMessageHandler(function(payload) {
  console.log('Received background message ', payload);

  const notificationTitle = payload.notification.title || 'Notification Title';
  const notificationOptions = {
    body: payload.notification.body || 'Notification Body',
    icon: payload.notification.icon || '/firebase-logo.png'
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});
