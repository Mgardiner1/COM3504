// file for creating a connection to MongoDB images database
const mongoose = require('mongoose');
const mongoDB = 'mongodb://localhost:27017/images';

mongoose.Promise = global.Promise;

try {
    var connection = mongoose.createConnection(mongoDB);
    console.log("connection to mongodb worked!");
}catch (e) {
    console.log('error in db connection: ' +e.message);
}
