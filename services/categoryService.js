const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const asyncHandler = require('express-async-handler');

const factory = require('./handlersFactory');
const { uploadSingleImage } = require('../middlewares/uploadImageMiddleware');

const Category = require('../models/categoryModel');

// Upload single image
exports.uploadCategoryImage = uploadSingleImage('image');
// Resize image
exports.resizeImage = asyncHandler(async (req, res, next) => {
  if (!req.file) return next();

  // req.file.filename = `category-${uuidv4()}-${Date.now()}.jpeg`;
  const ext = req.file.mimetype.split('/')[1];
  const filename = `category-${uuidv4()}-${Date.now()}.${ext}`;

  await sharp(req.file.buffer)
    // .resize(500, 500)
    .toFile(`uploads/categories/${filename}`); // write into a file on the disk

  req.body.image = filename;
  next();
});

// @desc     Get category
// @route   GET  /api/v1/categories
// @acces   Public
exports.getCategories = factory.getAll(Category);

// @desc     Get specific category by id
// @route   GET  /api/v1/categories:id
// @acces   Public
exports.getCategory = factory.getOne(Category);

// @desc     Create category
// @route   POST  /api/v1/categories
// @acces   Private/Admin-Manager
exports.createCategory = factory.createOne(Category);

// @desc     Update specific category by id
// @route   PUT  /api/v1/categories/:id
// @acces   Private/Admin-Manager
exports.updateCategory = factory.updateOne(Category);

// @desc     Delete specific category by id
// @route   DELETE  /api/v1/categories/:id
// @acces   Private/Admin
exports.deleteCategory = factory.deleteOne(Category);
