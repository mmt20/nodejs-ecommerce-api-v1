const express = require('express');

const { createCashOrder } = require('../services/orderService');

const authService = require('../services/authService');

const router = express.Router();

router.use(authService.protect, authService.allowedTo('user'));

router.route('/:cartId').post(createCashOrder);

module.exports = router;
