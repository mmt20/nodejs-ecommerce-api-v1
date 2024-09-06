const slugify = require('slugify');
const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/apiError');

const Category = require('../models/categoryModel');

// @des     Get category
// @route   GET  /api/v1/categories
// @acces   Public
exports.getCategories = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const skip = (page - 1) * limit; //
  const categories = await Category.find({}).skip(skip).limit(limit);
  res.status(200).json({ results: categories.length, page, data: categories });
});

// @des     Get specific category by id
// @route   GET  /api/v1/categories:id
// @acces   Public
exports.getCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const category = await Category.findById(id);
  if (!category) {
    //res.status(404).json({ msg: `No category found for this ID: ${id}` });
    return next(new ApiError(`No category found for this ID: ${id}`, 404));
  }
  res.status(200).json({ data: category });
});

// @des     Create category
// @route   POST  /api/v1/categories
// @acces   Private
exports.createCategory = asyncHandler(async (req, res) => {
  const name = req.body.name;
  const category = await Category.create({ name, slug: slugify(name) });
  res.status(201).json({ data: category });
});

// @des     Update specific category by id
// @route   PUT  /api/v1/categories/:id
// @acces   Private
exports.updateCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const name = req.body.name;
  const category = await Category.findByIdAndUpdate(
    { _id: id },
    { name, slug: slugify(name) },
    { new: true }
  );
  if (!category) {
    return next(new ApiError(`No category found for this ID: ${id}`, 404));
  }
  res.status(200).json({ data: category });
});

// @des     Delete specific category by id
// @route   DELETE  /api/v1/categories/:id
// @acces   Private
exports.deleteCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const category = await Category.findByIdAndDelete(id);
  if (!category) {
    return next(new ApiError(`No category found for this ID: ${id}`, 404));
  }
  res.status(204).send();
});
