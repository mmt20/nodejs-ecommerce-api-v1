const express = require('express');
const { param, validationResult } = require('express-validator');
const {
  getCategoryValidator,
  createCategoryValidator,
  updateCategoryValidator,
  deleteCategoryValidator,
} = require('../utils/validators/categoryValidator');
const {
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategories,
} = require('../services/categoryService');

const router = express.Router();

// router.get('/', getCategory);
// router.post('/', createCategory);

router
  .route('/')
  .get(getCategories)
  .post(createCategoryValidator, createCategory);
router
  .route('/:id')
  .get(getCategoryValidator, getCategory)
  .put(updateCategoryValidator, updateCategory)
  .delete(deleteCategoryValidator, deleteCategory);

module.exports = router;
