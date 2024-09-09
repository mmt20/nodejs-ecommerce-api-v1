const slugify = require('slugify');
const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/apiError');

const Brand = require('../models/brandModel');

// @des     Get brands
// @route   GET  /api/v1/brands
// @acces   Public
exports.getBrands = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 5;
  const skip = (page - 1) * limit; //
  const brand = await Brand.find({}).skip(skip).limit(limit);
  res.status(200).json({ results: brand.length, page, data: brand });
});

// @des     Get specific brand by id
// @route   GET  /api/v1/brand:id
// @acces   Public
exports.getBrand = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const brands = await Brand.findById(id);
  if (!brands) {
    return next(new ApiError(`No Brand found for this id: ${id}`, 404));
  }
  res.status(200).json({ data: brands });
});

// @des     Create brand
// @route   POST  /api/v1/brand
// @acces   Private
exports.createBrand = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const brand = await Brand.create({ name, slug: slugify(name) });
  res.status(201).json({ data: brand });
});

// @des     Update specific brand by id
// @route   PUT  /api/v1/brands/:id
// @acces   Private
exports.updateBrand = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;
  const brand = await Brand.findByIdAndUpdate(
    { _id: id },
    { name, slug: slugify(name) },
    { new: true }
  );
  if (!brand) {
    return next(new ApiError(`No Brand found for this id: ${id}`, 404));
  }
  res.status(200).json({ data: brand });
});

// @des     Delete specific brand by id
// @route   DELETE  /api/v1/brands/:id
// @acces   Private
exports.deleteBrand = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const brand = await Brand.findByIdAndDelete(id);
  if (!brand) {
    return next(new ApiError(`No Brand found for this id: ${id}`, 404));
  }
  res.status(204).send();
});
