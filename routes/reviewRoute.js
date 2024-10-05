const express = require('express');
const {
  createReviewValidator,
  updateReviewValidator,
  getReviewValidator,
  deleteReviewValidator,
} = require('../utils/validators/reviweValidator');
const {
  getReview,
  getReviews,
  createReview,
  updateReview,
  deleteReview,
  createFiliterObject,
  setProductIdAndUserIdToBody,
} = require('../services/reviewService');
const authService = require('../services/authService');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(createFiliterObject, getReviews)
  .post(
    authService.protect,
    authService.allowedTo('user'),
    setProductIdAndUserIdToBody,
    createReviewValidator,
    createReview
  );
router
  .route('/:id')
  .get(getReviewValidator, getReview)
  .put(
    authService.protect,
    authService.allowedTo('user'),
    updateReviewValidator,
    updateReview
  )
  .delete(
    authService.protect,
    authService.allowedTo('admin', 'manager', 'user'),
    deleteReviewValidator,
    deleteReview
  );

module.exports = router;
