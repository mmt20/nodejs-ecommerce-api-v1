const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/apiError');

const User = require('../models/userModel');

const createToken = (payload) =>
  jwt.sign({ userId: payload }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE_TIME,
  });

// @desc    Signup
// @route   GET  /api/v1/auth/signup
// @acces   Public
exports.signup = asyncHandler(async (req, res, next) => {
  // 1 - create User
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });

  // 2 - generate token
  const token = createToken(user._id);
  res.status(201).json({ data: user, token });
});

// @desc    Login
// @route   GET  /api/v1/auth/login
// @acces   Public
exports.login = asyncHandler(async (req, res, next) => {
  //1) check if password and email in the body (validation)
  //2) check if user exist && password is correct
  const user = await User.findOne({ email: req.body.email });

  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return next(new ApiError('Incorrect email or password', 401));
  }
  //3) generate token
  const token = createToken(user._id);
  //4) send response to client side
  res.status(200).json({ data: user, token });
});

exports.protect = asyncHandler(async (req, res, next) => {
  // 1) cheack if token exist , if exist hold it
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new ApiError(
        'You are not login, Please login to  get access for this route',
        401
      )
    );
  }
  // 2) verify token (no change happens, expires token)
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  if (!decoded) {
    return next(
      new ApiError(
        'You are not login, Please login to  get access for this route',
        401
      )
    );
  }

  // 3) check if user exists
  // const user = await User.findOne({ _id: decoded.userId });
  // console.log('user', user);

  // 4) check if user change his password after token created
});
