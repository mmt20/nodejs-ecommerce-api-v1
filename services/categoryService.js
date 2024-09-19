const factory = require('./handlerFactory');
const Category = require('../models/categoryModel');

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
// @acces   Private
exports.createCategory = factory.createOne(Category);

// @desc     Update specific category by id
// @route   PUT  /api/v1/categories/:id
// @acces   Private
exports.updateCategory = factory.updateOne(Category);

// @desc     Delete specific category by id
// @route   DELETE  /api/v1/categories/:id
// @acces   Private
exports.deleteCategory = factory.deleteOne(Category);
