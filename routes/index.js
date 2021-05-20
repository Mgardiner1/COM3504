var express = require('express');
var router = express.Router();
var image = require('../controllers/images');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Image Browsing' });
});
router.get('/terms', function(req, res, next) {
  res.render('terms', { title: 'Terms and Conditions' });
});
// include image controller functionality for MongoDB
router.post('/get_image', image.getImg);
router.post('/upload_image', image.insert);

module.exports = router;
