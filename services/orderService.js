const stripe = require('stripe')(process.env.STRIPE_SECRET);

const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/apiError');
const factory = require('./handlersFactory');

const Order = require('../models/orderModel');
const User = require('../models/userModel');
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
    products: cart.products,
    shippingAddress: req.body.shippingAddress,
    totalOrderPrice,
  });
  // 4) After creating order, decrement product quntity , increment product sold
  if (order) {
    const bulkOption = cart.products.map((item) => ({
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

// @desc    Get  order by id
// @route   POST /api/v1/orders/OrderId
// @access  Protected/User-Admin-Manager
exports.findSprcificOrder = factory.getOne(Order);

// @desc    Update order paid status to paid
// @route   PUT /api/v1/orders/:id/pay
// @access  Protected/Admin-Manager
exports.updateOrderToPaid = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(
      new ApiError(
        `There is no such order with this id : ${req.params.id}`,
        404
      )
    );
  }

  // update order to paid
  order.isPaid = true;
  order.paidAt = Date.now();

  const updatedOrder = await order.save();
  res.status(200).json({ status: 'success', data: updatedOrder });
});

// @desc    Update order delivered status
// @route   PUT /api/v1/orders/:id/deliver
// @access  Protected/Admin-Manager
exports.updateOrderToDelivered = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(
      new ApiError(
        `There is no such a order with this id:${req.params.id}`,
        404
      )
    );
  }
  // update order to paid
  order.isDelivered = true;
  order.deliveredAt = Date.now();
  const updatedOrder = await order.save();

  res.status(200).json({ status: 'success', data: updatedOrder });
});

// @desc    Get checkout session from stripe and send it as response
// @route   GET /api/v1/orders/checkout-session/cartId
// @access  Protected/User
exports.checkoutSession = asyncHandler(async (req, res, next) => {
  // 1) Get the currently cart
  const cart = await Cart.findById(req.params.cartId);
  if (!cart) {
    return next(
      new ApiError(`There is no cart for this user id : ${req.user._id}`, 404)
    );
  }

  // 2) Get cart price, Check if there is coupon apply
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;

  const totalOrderPrice = cartPrice;

  // 3) Create checkout session
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: 'egp',
          product_data: {
            name: req.user.name,
          },
          unit_amount: totalOrderPrice * 100,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    // success_url: `${req.protocol}://${req.get('host')}/orders`,
    success_url: `http://localhost:3000/user/allOrders`,
    // cancel_url: `${req.protocol}://${req.get('host')}/cart`,
    cancel_url: `http://localhost:3000/cart`,
    customer_email: req.user.email,
    client_reference_id: req.params.cartId, // to can create order
    metadata: req.body.shippingAddress,
  });

  // 4) send session to response
  res.status(200).json({ status: 'success', session });
});

const createOrderCheckout = async (session) => {
  try {
    // 1) Get needed data from session
    const cartId = session.client_reference_id;
    const shippingAddress = session.metadata;
    const checkoutAmount = session.amount_total / 100;

    // 2) Get Cart and User
    const cart = await Cart.findById(cartId);
    const user = await User.findOne({ email: session.customer_email });
    console.log('cart', cart);

    // 3) Create order
    const order = await Order.create({
      user: user._id,
      products: cart.products,
      shippingAddress: shippingAddress,
      totalOrderPrice: checkoutAmount,
      paymentMethodType: 'card',
      isPaid: true,
      paidAt: Date.now(),
    });

    // 4) After creating order decrement product quantity, increment sold
    if (order) {
      const bulkOption = cart.cartItems.map((item) => ({
        updateOne: {
          filter: { _id: item.product },
          update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
        },
      }));
      await Product.bulkWrite(bulkOption, {});

      // 5) Clear cart
      await Cart.findByIdAndDelete(cart._id);
    }
  } catch (error) {
    console.error('Error creating order or deleting cart:', error);
    throw error; // Re-throw error to be handled in the webhook
  }
};

// @desc    This webhook will run when stipe payment successfully paid
// @route   PUT /webhook-checkout
// @access  From stripe
exports.webhookCheckout = async (req, res, next) => {
  const signature = req.headers['stripe-signature'].toString();
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    await createOrderCheckout(event.data.object);
  }

  res.status(200).json({ received: true });
};
