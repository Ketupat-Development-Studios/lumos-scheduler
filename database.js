// Set the configuration for your app
// TODO: Replace with your project's config object
var firebase = require('firebase')
var config = {
    apiKey:         process.env.FIREBASE_API_KEY,
    authDomain:     process.env.FIREBASE_AUTH_DOMAIN,
    databaseURL:    process.env.FIREBASE_DATABASE_URL,
    storageBucket:  process.env.FIREBASE_STORAGE_BUCKET
};
firebase.initializeApp(config);

// Get a reference to the database service
module.exports = firebase.database();