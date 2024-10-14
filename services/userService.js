const asyncHandler = require('express-async-handler');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const bcrypt = require('bcryptjs');

const { uploadSingleImage } = require('../middlewares/uploadImageMiddleware');

const factory = require('./handlersFactory');
const ApiError = require('../utils/apiError');
const createToken = require('../utils/createToken');

const User = require('../models/userModel');

// Upload single image
exports.uploadUserImage = uploadSingleImage('profileImg');

// Image processing
exports.resizeImage = asyncHandler(async (req, res, next) => {
  const filename = `user-${uuidv4()}-${Date.now()}.jpeg`;
  if (req.file) {
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat('jpeg')
      .jpeg({ quality: 95 })
      .toFile(`uploads/users/${filename}`);

    // Save image into our db
    req.body.profileImg = filename;
  }
  next();
});

// @desc     Get users
// @route   GET  /api/v1/users
// @acces   Private/Admin
exports.getUsers = factory.getAll(User);

// @desc     Get specific user by id
// @route   GET  /api/v1/user:id
// @acces   Private/Admin
exports.getUser = factory.getOne(User);

// @desc     Create user
// @route   POST  /api/v1/users
// @acces   Private/Admin
exports.createUser = factory.createOne(User);

// @desc     Update specific user by id
// @route   PUT  /api/v1/users/:id
// @acces   Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  const document = await User.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      slug: req.body.slug,
      phone: req.body.phone,
      email: req.body.email,
      profileImg: req.body.profileImg,
      role: req.body.role,
    },
    {
      new: true,
    }
  );
  if (!document) {
    return next(
      new ApiError(`No document found for this id: ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ data: document });
});

exports.changeUserPassword = asyncHandler(async (req, res, next) => {
  const document = await User.findByIdAndUpdate(
    req.params.id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
    }
  );
  if (!document) {
    return next(
      new ApiError(`No document found for this id: ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ data: document });
});

// @desc     Delete specific user by id
// @route   DELETE  /api/v1/users/:id
// @acces   Private/Admin
exports.deleteUser = factory.deleteOne(User);

// @desc     Get Logged User data
// @route   GET  /api/v1/users/getMe
// @acces   Private/Protected
exports.getLoggedUserData = asyncHandler(async (req, res, next) => {
  req.params.id = req.user._id;
  next();
});

// @desc    Update Logged User password
// @route   PUT  /api/v1/users/updateMyPassword
// @acces   Private/Protected
exports.updateLoggedUserPassword = asyncHandler(async (req, res, next) => {
  // 1) Update user password based on user payload
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
    }
  );
  // 2) Generate token
  const token = createToken(user._id);
  res.status(200).json({ data: user, token });
});

// body = {name: "ahmed", password: "123"} , allowedFields = ["name", "phone"]
const filterObject = (obj, ...allowedFields) => {
  const newBodyObj = {};
  Object.keys(obj).forEach((key) => {
    if (allowedFields.includes(key)) newBodyObj[key] = obj[key];
  });
  return newBodyObj;
};

// @desc    Update Logged User data (without password and role)
// @route   PUT  /api/v1/users/updateMe
// @acces   Private/Protected
exports.updateLoggedUserData = asyncHandler(async (req, res, next) => {
  // 1) Select fields that allowed to update
  const allowedBodyFields = filterObject(req.body, 'name', 'email', 'phone');
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    allowedBodyFields,
    { new: true }
  );
  res.status(200).json({ data: updatedUser });
});

// @desc    Deactivate Logged User
// @route   DELETE  /api/v1/users/deleteMe
// @acces   Private/Protected
exports.deleteLoggedUserData = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });

  res.status(204).json({ status: 'Success' });
});
