const factory = require('./handlersFactory');
const Review = require('../models/reviewModel');

// Nested route
// GET /api/v1/products/:productId/reviews
exports.createFiliterObject = (req, res, next) => {
  let filiterObject = {};
  if (req.params.productId) filiterObject = { product: req.params.productId };
  req.filterObj = filiterObject;
  next();
};

// @desc    Get reviews
// @route   GET  /api/v1/reviews
// @acces   Public
exports.getReviews = factory.getAll(Review);

// @desc     Get specific reviews by id
// @route   GET  /api/v1/reviews:id
// @acces   Public
exports.getReview = factory.getOne(Review);

// Nested route (Create)
exports.setProductIdAndUserIdToBody = (req, res, next) => {
  if (!req.body.product) req.body.product = req.params.productId;
  if (!req.body.user) req.body.user = req.user._id;
  next();
};

// @desc    Create reviews
// @route   POST  /api/v1/reviews
// @acces   Private/Protect(user)
exports.createReview = factory.createOne(Review);

// @desc     Update specific reviews by id
// @route   PUT  /api/v1/reviews/:id
// @acces   Private/Protect(user)
exports.updateReview = factory.updateOne(Review);

// @desc     Delete specific reviews by id
// @route   DELETE  /api/v1/reviews/:id
// @acces   Private/Protect(user, admin , manager)
exports.deleteReview = factory.deleteOne(Review);
