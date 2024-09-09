const mongoose = require('mongoose');

// 1- Create Schema
const subCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      unique: [true, 'subCategory must be unique'],
      minlength: [2, 'Too short subCategory3 name'],
      maxlength: [32, 'Too long category name'],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: 'Category',
      required: [true, 'subCategory  must be belong to parent category'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('subCategory', subCategorySchema);
