var express = require('express');
var router = express.Router();
var image = require('../controllers/images');
const fetch = require('node-fetch');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Image Browsing' });
});

// Route for the terms and conditions
router.get('/terms', function(req, res, next) {
  res.render('terms', { title: 'Terms and Conditions' });
});


// include image controller functionality for MongoDB
router.post('/get_image', image.getImg);
router.post('/upload_image', image.insert);

// Route to fetch images from a website and convert them to base64 and return to the client
router.post('/get_image_url', function (req, res, next) {

    let img = req.body.urlImage; // whatever we receive from the browser
    if (img == null) {
        res.status(403).send('No data sent!')
    }
    try {
        let b ;
        fetch(img)
            .then(response => response.buffer())
            .then(buffer => {
                // Then create a base64 string
                b = "data:image/jpeg;base64,"+buffer.toString('base64');
                console.log(b);
                res.setHeader('Content-Type', 'application/json');
                res.json(b);
            })
    } catch (e) {
        res.status(500).send('error getting image base64 representation'+ e);
    }

});

module.exports = router;
