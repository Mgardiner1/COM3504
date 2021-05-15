const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// create image Schema with basic properties
const Image = new Schema (
    {
        title: {type: String,  required: true, max: 50},
        description: {type: String, required: true, max: 200},
        author: {type: String, required: true, max: 50},
        image_blob: {type: String, required:true}
    }
);

Image.set('toObject', {getters: true, virtuals: false});

module.exports = mongoose.model('Image', Image);