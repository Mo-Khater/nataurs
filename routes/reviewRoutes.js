const express = require('express');
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');
const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
  .route('/')
  .get(
    reviewController.getReviews,
  )
  .post(

    authController.restrictto('user'),
    reviewController.addtouruserIds,
    reviewController.createReview,
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .delete(
    authController.restrictto('admin', 'user', 'lead-guide'),
    reviewController.deleteReview,
  )
  .patch(
    authController.restrictto('admin', 'user', 'lead-guide'),
    reviewController.updateReview,
  );

module.exports = router;
