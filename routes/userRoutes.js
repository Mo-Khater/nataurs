const express = require('express');
const routeController = require('../controllers/userController');
const authController = require('../controllers/authController');
const router = express.Router();

router.route('/signup').post(authController.signup);
router.route('/login').post(authController.login);
router.route('/logout').get(authController.logout);
router.route('/forgetpassword').post(authController.forgetpassword);
router.route('/resetpassword/:token').patch(authController.resetpassword);

router.use(authController.protect);

router.route('/me').get(routeController.getMe, routeController.getUser);
router.route('/updatepassword').patch(authController.updatePassword);
router
  .route('/updateMe')
  .patch(routeController.uploadUserPhoto, routeController.updateMe);
router.route('/deleteMe').delete(routeController.deleteMe);

router.use(authController.restrictto('admin'));

router.route('/').get(routeController.getAllUsers);
router
  .route('/:id')
  .get(routeController.getUser)
  .patch(routeController.updateUser)
  .delete(routeController.deleteUser);

module.exports = router;
