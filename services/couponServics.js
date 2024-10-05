const factory = require('./handlerFactory');
const Coupon = require('../models/CouponModel');

// @desc    Get coupons
// @route   GET  /api/v1/coupons
// @acces   Private/Adman-Manger
exports.getCoupons = factory.getAll(Coupon);

// @desc     Get specific Coupon by id
// @route   GET  /api/v1/coupons:id
// @acces   Private/Adman-Manger
exports.getCoupon = factory.getOne(Coupon);

// @desc    Create coupon
// @route   POST  /api/v1/coupons
// @acces   Private/Admin-Manager
exports.createCoupon = factory.createOne(Coupon);

// @desc    Update specific coupon by id
// @route   PUT  /api/v1/coupons/:id
// @acces   Private/Admin-Manager
exports.updateCoupon = factory.updateOne(Coupon);

// @desc    Delete specific coupon by id
// @route   DELETE  /api/v1/coupons/:id
// @acces   Private/Admin-Manager
exports.deleteCoupon = factory.deleteOne(Coupon);
