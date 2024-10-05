const multer = require('multer');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/apiError');
const { uploadMixOfImages } = require('../middlewares/uploadImageMiddleware');

const factory = require('./handlerFactory');
const Product = require('../models/productModel');

exports.uploadProducyImages = uploadMixOfImages([
  {
    name: 'imageCover',
    maxCount: 1,
  },
  { name: 'images', maxCount: 8 },
]);

exports.resizeProductImages = asyncHandler(async (req, res, next) => {
  // console.log(req.files);
  // Image processing for imageCover
  if (req.files.imageCover) {
    const imageCoverFileName = `product-${uuidv4()}-${Date.now()}-cover.jpeg`;
    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 95 })
      .toFile(`uploads/products/${imageCoverFileName}`);

    // Save image into our db
    req.body.imageCover = imageCoverFileName;
  }
  // Image processing for images
  if (req.files.images) {
    req.body.images = [];
    await Promise.all(
      req.files.images.map(async (img, index) => {
        const imageName = `product-${uuidv4()}-${Date.now()}-${index + 1}.jpeg`;
        await sharp(img.buffer)
          .resize(2000, 1333)
          .toFormat('jpeg')
          .jpeg({ quality: 95 })
          .toFile(`uploads/products/${imageName}`);

        // Save image into our db
        req.body.images.push(imageName);
      })
    );
    next();
  }
});

// @desc     Get list of Product
// @route   GET  /api/v1/products
// @acces   Public
exports.getProducts = factory.getAll(Product, 'Products');

// @desc     Get specific product by id
// @route   GET  /api/v1/products:id
// @acces   Public
exports.getProduct = factory.getOne(Product, 'reviwes');

// @desc     Create product
// @route   POST  /api/v1/products
// @acces   Private
exports.createProduct = factory.createOne(Product);

// @desc     Update specific product by id
// @route   PUT  /api/v1/products/:id
// @acces   Private
exports.updateProduct = factory.updateOne(Product);

// @desc     Delete specific product by id
// @route   DELETE  /api/v1/products/:id
// @acces   Private
exports.deleteProduct = factory.deleteOne(Product);
