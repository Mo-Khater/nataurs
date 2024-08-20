const express = require('express');
const routeController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewRouter = require('../routes/reviewRoutes');
const router = express.Router();

// router.param('id',routeController.checkID)
router
  .route('/aliasTopTours')
  .get(routeController.aliasTopTours, routeController.getAllTours);

router.route('/tour-stats').get(routeController.getTourStats);

router
  .route('/monthly-paid/:year')
  .get(
    authController.protect,
    authController.restrictto('admin', 'lead-guide', 'user'),
    routeController.getMonthlyPaid,
  );

router
  .route('/distance/:distance/center/:latlen/unit/:unit')
  .get(routeController.gettourswithin);

router
  .route('/distance/center/:latlen/unit/:unit')
  .get(routeController.getDistances);

router
  .route('/')
  .get(routeController.getAllTours)
  .post(
    authController.protect,
    authController.restrictto('admin', 'lead-guide'),
    routeController.createTour,
  );

router
  .route('/:id')
  .get(routeController.getTour)
  .patch(
    authController.protect,
    authController.restrictto('admin', 'lead-guide'),
    routeController.updateTour,
  )
  .delete(
    authController.protect,
    authController.restrictto('admin', 'lead-guide'),
    routeController.deleteTour,
  );

router.use('/:tourId/reviews', reviewRouter);

module.exports = router;
