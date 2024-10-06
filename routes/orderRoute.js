const express = require('express');

const {
  createCashOrder,
  findAllOrders,
  findSprcificOrder,
  filiterOrdersforLoggedUser,
} = require('../services/orderService');

const authService = require('../services/authService');

const router = express.Router();

router.use(authService.protect);

router.route('/:cartId').post(authService.allowedTo('user'), createCashOrder);

router.get(
  '/',
  authService.allowedTo('admin', 'manager', 'user'),
  filiterOrdersforLoggedUser,
  findAllOrders
);
router.get('/:id', findSprcificOrder);

module.exports = router;
