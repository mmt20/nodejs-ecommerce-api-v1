const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('node:crypto');

const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/apiError');
const sendEmail = require('../utils/sendEmail');
const createToken = require('../utils/createToken');
const { sanitizeUser } = require('../utils/sanitizeData');

const User = require('../models/userModel');
const { equal } = require('node:assert');

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
  res.status(201).json({ data: sanitizeUser(user), token });
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

  // Delete password from response
  delete user._doc.password;

  //4) send response to client side
  res.status(200).json({ data: user, token });
});

// @desc    make sure the user is logged in
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
  const currentUser = await User.findById(decoded.userId);

  if (!currentUser) {
    return next(
      new ApiError(
        'The user that belong to thistoken does not longer exist',
        401
      )
    );
  }
  //  check if is activeted
  // if (!currentUser.active) {
  //   return next(
  //     new ApiError(
  //       'Your account has been disabled, you must first activate it',
  //       401
  //     )
  //   );
  // }
  // 4) check if user change his password after token created
  if (currentUser.passwordChangedAt) {
    const passChangedTimestamp = parseInt(
      currentUser.passwordChangedAt.getTime() / 1000,
      10
    );

    // password changed after token created
    if (passChangedTimestamp > decoded.iat) {
      return next(
        new ApiError(
          'User recently changed his password. please login again..',
          401
        )
      );
    }
  }
  req.user = currentUser;
  next();
});

// @desc   Authorizaton (User Permissions)
// @acces ["admin", "manager"]
exports.allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    // 1) access roles
    // 2) access registered user (req.user.role)
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError('You are not allowed to access this route', 403)
      );
    }
    next();
  });

// @desc    Forgot password
// @route   POST  /api/v1/auth/forgotpassword
// @acces   Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  // 1) Get user by email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new ApiError(`There is no user with this email ${req.body.email}`, 404)
    );
  }
  // 2) If user exists, Generate hash reset random 6 digits and save it in db
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedResetCode = crypto
    .createHash('sha256')
    .update(resetCode)
    .digest('hex');
  // save hashed password reset code in db
  user.passwordResetCode = hashedResetCode;
  // Add experiration time for reset code (10 min)
  user.passwordResetExpire = Date.now() + 10 * 60 * 1000;
  user.passwordResetVerified = false;

  user.save();
  const message = `Hi ${user.name},\n We received a request to reset the password on your E-shop Account. \n ${resetCode} \n Enter this code to complete the reset. \n Thanks for helping us keep your account secure.\n The E-shop Team`;

  // 3) Send the reset code via email
  try {
    await sendEmail({
      email: user.email,
      subject: 'Your Password resetcode (Valid for 10 min )',
      message,
    });
  } catch (err) {
    user.passwordResetCode = undefined;
    user.passwordResetExpire = undefined;
    user.passwordResetVerified = undefined;

    await user.save();
    return next(new ApiError('There is an error in sending email', 500));
  }

  res
    .status(200)
    .json({ satus: 'Success', message: 'Reset Code sent to email' });
});

// @desc    Verfiy Reset Code
// @route   POST  /api/v1/auth/verfiyResetCode
// @acces   Public
exports.verfyPasswordResetCode = asyncHandler(async (req, res, next) => {
  // 1) Get user based on reset code
  const hashedResetCode = crypto
    .createHash('sha256')
    .update(req.body.resetCode)
    .digest('hex');

  const user = await User.findOne({
    passwordResetCode: hashedResetCode,
    passwordResetExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(new ApiError(`Reset code invalid or expired`, 403));
  }
  // 2) Reset code vaild
  user.passwordResetVerified = true;
  await user.save();

  res.status(200).json({
    status: 'Success',
  });
});

// @desc    Reset Password
// @route   POST  /api/v1/auth/resetPassword
// @acces   Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // 1) Get user based on email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new ApiError(`There is no user for this ${equal.body.email}`, 404)
    );
  }
  // 2) Check if reset code verfied
  if (!user.passwordResetVerified) {
    return next(new ApiError(`Reset code not verified`, 400));
  }

  user.password = req.body.newPassword;

  user.passwordResetCode = undefined;
  user.passwordResetExpire = undefined;
  user.passwordResetVerified = undefined;

  await user.save();

  // 3) if everything is ok, generate token
  const token = createToken(user._id);
  res.status(200).json({ token });
});
