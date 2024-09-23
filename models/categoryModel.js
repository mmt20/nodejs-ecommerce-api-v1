const mongoose = require('mongoose');

// 1- Create Schema
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category required'],
      unique: [true, 'Category must be unique'],
      minlength: [3, 'Too short category name'],
      maxlength: [32, 'Too long category name'],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    image: String,
  },
  { timestamps: true }
);

const setImageUrl = (doc) => {
  // return image baseUrl + image name
  if (doc.image) {
    const imageUrl = `${process.env.BASE_URL}/categories/${doc.image}`;
    doc.image = imageUrl;
  }
};
// findOne , findAll and update
categorySchema.post('init', (doc) => {
  setImageUrl(doc);
});

// create
categorySchema.post('save', (doc) => {
  setImageUrl(doc);
});

//2- Create model
const CategoryModel = mongoose.model('Category', categorySchema);

module.exports = CategoryModel;
