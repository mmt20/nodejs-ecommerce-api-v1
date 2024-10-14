const express = require('express');

const {
  addAddress,
  removeAddress,
  getLoggedUserAddresses,
  updateAddress,
  getAddress,
} = require('../services/addressService');
const authService = require('../services/authService');

const router = express.Router();

router.use(authService.protect);

router.route('/').post(addAddress).get(getLoggedUserAddresses);

router
  .route('/:addressId')
  .get(getAddress)
  .delete(removeAddress)
  .put(updateAddress);

module.exports = router;
