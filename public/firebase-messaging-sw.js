importScripts("https://www.gstatic.com/firebasejs/9.8.4/firebase-app-compat.js")
importScripts("https://www.gstatic.com/firebasejs/9.8.4/firebase-messaging-compat.js")


 
const firebaseConfig = {
  apiKey: "AIzaSyCvc6HQvKcOtGarHYoHjQT6vuCb4G5mIpc",
  authDomain: "lidenar.firebaseapp.com",
  projectId: "lidenar",
  storageBucket: "lidenar.appspot.com",
  messagingSenderId: "952981137697",
  appId: "1:952981137697:web:43e329941177ac27163660",
  measurementId: "G-VLT5Z6YCXW"
};

const app = firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging(app);


messaging.onBackgroundMessage(payload => {
    console.log("Recibiste mensaje mientras estabas ausente");
// previo a mostrar notificación
    const notificationTitle= payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: "/logo192.png"
    }


    return self.registration.showNotification(
        notificationTitle, 
        notificationOptions
    )
})