const express = require('express');
const router = express.Router();
const viewController = require('../controllers/viewscontroller');
const autController = require('../controllers/authController');

router.get('/', autController.isLoggedIn, viewController.getOverview);

router.get('/tour/:slug', autController.isLoggedIn, viewController.getTour);

router.get('/login', autController.isLoggedIn, viewController.login);
router.get('/me', autController.protect, viewController.getuseraccount);

module.exports = router;
