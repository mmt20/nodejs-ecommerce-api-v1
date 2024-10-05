const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const asyncHandler = require('express-async-handler');

const factory = require('./handlerFactory');
const Review = require('../models/reviewModel');

// @desc    Get reviews
// @route   GET  /api/v1/reviews
// @acces   Public
exports.getReviews = factory.getAll(Review);

// @desc     Get specific reviews by id
// @route   GET  /api/v1/reviews:id
// @acces   Public
exports.getReview = factory.getOne(Review);

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
