const express = require('express');
const {
  addProductToCart,
  updateCartProductCount,
  getLoggedUserCart,
  removeCartProduct,
  clearLoggedUserCart,
  applyCouponToCart,
} = require('../services/cartService');

const authService = require('../services/authService');

const router = express.Router();

router.use(authService.protect, authService.allowedTo('user'));

router.route('/applyCoupon').put(applyCouponToCart);

router
  .route('/')
  .post(addProductToCart)
  .get(getLoggedUserCart)
  .delete(clearLoggedUserCart);

router.route('/:itemId').put(updateCartProductCount).delete(removeCartProduct);

module.exports = router;
