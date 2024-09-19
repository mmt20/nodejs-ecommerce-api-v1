const Brand = require('../models/brandModel');
const factory = require('./handlerFactory');
// @desc     Get brands
// @route   GET  /api/v1/brands
// @acces   Public
exports.getBrands = factory.getAll(Brand);

// @desc     Get specific brand by id
// @route   GET  /api/v1/brand:id
// @acces   Public
exports.getBrand = factory.getOne(Brand);

// @desc     Create brand
// @route   POST  /api/v1/brand
// @acces   Private
exports.createBrand = factory.createOne(Brand);

// @desc     Update specific brand by id
// @route   PUT  /api/v1/brands/:id
// @acces   Private
exports.updateBrand = factory.updateOne(Brand);

// @desc     Delete specific brand by id
// @route   DELETE  /api/v1/brands/:id
// @acces   Private
exports.deleteBrand = factory.deleteOne(Brand);
