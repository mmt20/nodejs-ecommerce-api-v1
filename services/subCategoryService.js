const slugify = require('slugify');
const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/apiError');
const SubCategory = require('../models/subCategoryModel');

exports.setCategoryIdToBody = (req, res, next) => {
  // Nested route
  if (!req.body.category) req.body.category = req.params.categoryId;
  next();
};
// @des     Create subCategory
// @route   POST  /api/v1/subsubCategory
// @acces   Private
exports.createsubCategory = asyncHandler(async (req, res) => {
  const { name, category } = req.body;
  const subCategory = await SubCategory.create({
    name,
    slug: slugify(name),
    category,
  });
  res.status(201).json({ data: subCategory });
});

// Nested route
// GET /api/v1/categories/:categoryId/subcategories
exports.createFiliterObject = (req, res, next) => {
  let filiterObject = {};
  if (req.params.categoryId)
    filiterObject = { category: req.params.categoryId };
  req.filiterObject = filiterObject;
  next();
};

// @des     Get subCategory
// @route   GET  /api/v1/subcategory
// @acces   Public
exports.getSubCategories = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 5;
  const skip = (page - 1) * limit;

  console.log(req.params);
  const subCategories = await SubCategory.find(req.filiterObject)
    .skip(skip)
    .limit(limit);
  //.populate({ path: 'category', select: 'name -_id' });

  res
    .status(200)
    .json({ results: subCategories.length, page, data: subCategories });
});

// @des     Get specific subCategory by id
// @route   GET  /api/v1/subcategory:id
// @acces   Public
exports.getSubCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const subCategory = await SubCategory.findById(id);
  if (!subCategory) {
    return next(new ApiError(`No subCategory found for this id: ${id}`, 404));
  }
  res.status(200).json({ data: subCategory });
});

// @des     Update specific subcategory by id
// @route   PUT  /api/v1/subcategories/:id
// @acces   Private
exports.updateSubCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name, category } = req.body;
  const subcategory = await SubCategory.findByIdAndUpdate(
    { _id: id },
    { name, category, slug: slugify(name) },
    { new: true }
  );
  if (!subcategory) {
    return next(new ApiError(`No subCategory found for this id: ${id}`, 404));
  }
  res.status(200).json({ data: subcategory });
});

// @des     Delete specific subcategory by id
// @route   DELETE  /api/v1/subcategories/:id
// @acces   Private
exports.deleteSubCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const subcategory = await SubCategory.findByIdAndDelete(id);
  if (!subcategory) {
    return next(new ApiError(`No subCategory found for this id: ${id}`, 404));
  }
  res.status(204).send();
});
