const factory = require('./handlerFactory');

const SubCategory = require('../models/subCategoryModel');

exports.setCategoryIdToBody = (req, res, next) => {
  // Nested route (Create)
  if (!req.body.category) req.body.category = req.params.categoryId;
  next();
};

// Nested route
// GET /api/v1/categories/:categoryId/subcategories
exports.createFiliterObject = (req, res, next) => {
  let filiterObject = {};
  if (req.params.categoryId)
    filiterObject = { category: req.params.categoryId };
  req.filterObj = filiterObject;
  next();
};

// @desc     Get subCategories
// @route   GET  /api/v1/subcategories
// @acces   Public
exports.getSubCategories = factory.getAll(SubCategory);

// @desc     Get specific subCategory by id
// @route   GET  /api/v1/subcategory:id
// @acces   Public
exports.getSubCategory = factory.getOne(SubCategory);

// @desc     Create subCategory
// @route   POST  /api/v1/subsubCategory
// @acces   Private
exports.createsubCategory = factory.createOne(SubCategory);

// @desc     Update specific subcategory by id
// @route   PUT  /api/v1/subcategories/:id
// @acces   Private
exports.updateSubCategory = factory.updateOne(SubCategory);

// @desc     Delete specific subcategory by id
// @route   DELETE  /api/v1/subcategories/:id
// @acces   Private
exports.deleteSubCategory = factory.deleteOne(SubCategory);
