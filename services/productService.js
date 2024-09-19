const factory = require('./handlerFactory');

const Product = require('../models/productModel');

// @desc     Get list of Product
// @route   GET  /api/v1/products
// @acces   Public
exports.getProducts = factory.getAll(Product, 'Products');

// @desc     Get specific product by id
// @route   GET  /api/v1/products:id
// @acces   Public
exports.getProduct = factory.getOne(Product);

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
