module.exports = {
  swcMinify: false,
  trailingSlash: true,
  env: {
    // HOST LOCAL
    // HOST_API_KEY: 'http://localhost:7070',
    // HOST_SOCKET: 'ws://localhost:80',
    // HOST REMOTO
    HOST_API_KEY: 'https://crm.lidenar.com',
    HOST_SOCKET: 'wss://ss.lidenar.com',
    // MAPBOX
    MAPBOX_API: 'pk.eyJ1Ijoic2lzdGVtYXMtMjEwMCIsImEiOiJjbHJwM2p6OTgwMG1vMnFvNjZ5dnM5OHo4In0.WfTKE_C5op0Ameu3Llhldw',
    // FIREBASE
    FIREBASE_API_KEY: 'AIzaSyCvc6HQvKcOtGarHYoHjQT6vuCb4G5mIpc',
    FIREBASE_AUTH_DOMAIN: 'lidenar.firebaseapp.com',
    FIREBASE_PROJECT_ID: 'lidenar',
    FIREBASE_STORAGE_BUCKET: 'lidenar.appspot.com',
    FIREBASE_MESSAGING_SENDER_ID: '952981137697',
    FIREBASE_APPID: '1:952981137697:web:43e329941177ac27163660',
    FIREBASE_MEASUREMENT_ID: 'G-VLT5Z6YCXW',
    // AWS COGNITO
    AWS_COGNITO_USER_POOL_ID: '',
    AWS_COGNITO_CLIENT_ID: '',
    // AUTH0
    AUTH0_DOMAIN: '',
    AUTH0_CLIENT_ID: '',
  },
};