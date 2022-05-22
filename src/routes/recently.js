const router = require('express-promise-router')();
const recentlyController = require('../controllers/recently.controller');

router.route('/').get(recentlyController.getManga);

module.exports = router;
