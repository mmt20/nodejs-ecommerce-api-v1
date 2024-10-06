const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/apiError');
const factory = require('./handlersFactory');

const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');

// @desc    create cash order
// @route   Post  /api/v1/orders/cartId
// @acces   Private/User
exports.createCashOrder = asyncHandler(async (req, res, next) => {
  // app settings
  const taxPric = 0;
  const shippingPrice = 0;

  // 1) Get cart depend on cartId
  const cart = await Cart.findById(req.params.cartId);
  if (!cart) {
    return next(
      new ApiError(`There is no cart for this user id : ${req.user._id}`, 404)
    );
  }

  // 2) Get order price depend on cart price "Check if coupon applyed"
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;
  const totalOrderPrice = cartPrice + taxPric + shippingPrice;
  // 3) Create order with defult paymentMethodType cash
  const order = await Order.create({
    user: req.user._id,
    cartItems: cart.cartItems,
    shippingAddress: req.body.shippingAddress,
    totalOrderPrice,
  });
  // 4) After creating order, decrement product quntity , increment product sold
  if (order) {
    const bulkOption = cart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
      },
    }));
    await Product.bulkWrite(bulkOption, {});

    // 5) Clear cart depend on cartId
    await Cart.findByIdAndDelete(req.params.cartId);
  }
  res.status(201).json({ status: 'success', data: order });
});

exports.filiterOrdersforLoggedUser = asyncHandler(async (req, res, next) => {
  let filiter = {};
  if (req.user.role === 'user') {
    req.filterObj = { user: req.user._id };
  }
  next();
});

// @desc    Get all orders
// @route   Post  /api/v1/orders
// @acces   Private/User-Admin-Manager
exports.findAllOrders = factory.getAll(Order);

exports.findSprcificOrder = factory.getOne(Order);
