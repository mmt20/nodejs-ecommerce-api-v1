const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const asyncHandler = require('express-async-handler');

const { uploadSingleImage } = require('../middlewares/uploadImageMiddleware');

const factory = require('./handlerFactory');
const Brand = require('../models/brandModel');

// @desc     Get brands
// @route   GET  /api/v1/brands
// @acces   Public
exports.getBrands = factory.getAll(Brand);

// @desc     Get specific brand by id
// @route   GET  /api/v1/brand:id
// @acces   Public
exports.getBrand = factory.getOne(Brand);

// Upload single image
exports.uploadBrandImage = uploadSingleImage('image');

// Image processing
exports.resizeImage = asyncHandler(async (req, res, next) => {
  const filename = `brand-${uuidv4()}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(600, 600)
    .toFormat('jpeg')
    .jpeg({ quality: 95 })
    .toFile(`uploads/brands/${filename}`);

  // Save image into our db
  req.body.image = filename;

  next();
});

// @desc     Create brand
// @route   POST  /api/v1/brand
// @acces   Private/Admin-Manager
exports.createBrand = factory.createOne(Brand);

// @desc     Update specific brand by id
// @route   PUT  /api/v1/brands/:id
// @acces   Private/Admin-Manager
exports.updateBrand = factory.updateOne(Brand);

// @desc     Delete specific brand by id
// @route   DELETE  /api/v1/brands/:id
// @acces   Private/Admin
exports.deleteBrand = factory.deleteOne(Brand);
