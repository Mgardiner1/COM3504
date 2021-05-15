// file for creating a connection to MongoDB images database
const mongoose = require('mongoose');

const mongoDB = 'mongodb://localhost:27017/images';

mongoose.Promise = global.Promise;

try {
    connection = mongoose.connect(mongoDB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        checkServerIdentity: false,
    });

    console.log(connection);
    console.log('connection to mongodb worked!');
} catch (e) {
    console.log('error in db connection: ' +e.message);
}
