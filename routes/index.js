var express = require('express');
var router = express.Router();

var user_controller = require('../controllers/userController');

/* GET home page. */
router.get('/', function(req, res) {
  // Render the basebydottie homepage
  res.render('index', { title: 'Base By Dottie' });
});

/* GET login page */
router.get('/login', user_controller.login_get);

/* POST login page */
router.post('/login', user_controller.login_post);

/* GET logout page */

/* POST profile page */

module.exports = router;
