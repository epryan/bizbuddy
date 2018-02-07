var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  // Render the basebydottie homepage
  res.render('index', { title: 'Base By Dottie' });
});

/* GET login page */

/* GET logout page */

/* POST profile page */

module.exports = router;
