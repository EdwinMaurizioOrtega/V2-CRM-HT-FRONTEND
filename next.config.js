module.exports = {
  swcMinify: false,
  trailingSlash: true,
  env: {
    // HOST LOCAL
    HOST_API_KEY: 'http://localhost:7070',
    HOST_SOCKET: 'ws://localhost:80',
    // HOST REMOTO
    // HOST_API_KEY: 'https://crm.lidenar.com',
    // HOST_SOCKET: 'wss://ss.lidenar.com',
    // MAPBOX
    MAPBOX_API: 'pk.eyJ1Ijoic2lzdGVtYXMtMjEwMCIsImEiOiJjbHJwM2p6OTgwMG1vMnFvNjZ5dnM5OHo4In0.WfTKE_C5op0Ameu3Llhldw',
    // FIREBASE
    FIREBASE_API_KEY: '',
    FIREBASE_AUTH_DOMAIN: '',
    FIREBASE_PROJECT_ID: '',
    FIREBASE_STORAGE_BUCKET: '',
    FIREBASE_MESSAGING_SENDER_ID: '',
    FIREBASE_APPID: '',
    FIREBASE_MEASUREMENT_ID: '',
    // AWS COGNITO
    AWS_COGNITO_USER_POOL_ID: '',
    AWS_COGNITO_CLIENT_ID: '',
    // AUTH0
    AUTH0_DOMAIN: '',
    AUTH0_CLIENT_ID: '',
  },
};