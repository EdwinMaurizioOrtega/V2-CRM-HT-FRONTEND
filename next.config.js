module.exports = {
  swcMinify: false,
  trailingSlash: true,
  env: {

    // HOST LOCAL PRIVATE
    // HOST_API_KEY: 'http://192.168.88.120:7070',
    // HOST_SOCKET: 'ws://192.168.88.120:80',

    // HOST LOCAL
    // HOST_API_KEY: 'http://192.168.0.154:7070',
    // HOST_API_KEY: 'http://localhost:7070',
    // HOST_SOCKET: 'ws://localhost:80',

    // HOST REMOTO
    HOST_API_KEY: 'https://crm.hipertronics.us',
    HOST_SOCKET: 'wss://ss.hipertronics.us',

    // MAPBOX
    MAPBOX_API: '',
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