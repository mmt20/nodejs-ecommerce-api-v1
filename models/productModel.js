const mongoose = require('mongoose');

// 1- Create Schema
const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: [3, 'Too short Product name'],
      maxlength: [100, 'Too long Product name'],
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
      lowercase: [true, 'Product descrption is required'],
      minlength: [20, 'Too short product descrption '],
    },
    quantity: {
      type: Number,
      required: [true, 'Product quantity is required '],
    },
    sold: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      trim: true,
      max: [200000, 'Too long product price'],
    },
    priceAfterDiscount: {
      type: Number,
    },
    colors: [String],
    imageCover: {
      type: String,
      required: [true, 'Image cover is required'],
    },
    images: [String],
    category: {
      type: mongoose.Schema.ObjectId,
      ref: 'Category',
      required: [true, 'Product  must be belong to category'],
    },
    subcategories: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'subCategory',
      },
    ],
    brand: { type: mongoose.Schema.ObjectId, ref: 'Brand' },
    ratingsAverage: {
      type: Number,
      min: [1, 'Rating must be about or equal 1.0'],
      max: [5, 'Rating must be below or equal 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);
// Mongoose query midlleware
productSchema.pre(/^find/, function (next) {
  this.populate({ path: 'category', select: 'name -_id' });
  next();
});

const setImageUrl = (doc) => {
  // return image baseUrl + image name
  if (doc.imageCover) {
    const imageUrl = `${process.env.BASE_URL}/products/${doc.imageCover}`;
    doc.imageCover = imageUrl;
  }
  if (doc.images) {
    const imagesList = [];
    doc.images.forEach((image) => {
      const imageUrl = `${process.env.BASE_URL}/products/${image}`;
      imagesList.push(imageUrl);
    });
    doc.images = imagesList;
  }
};
// findOne , findAll and update
productSchema.post('init', (doc) => {
  setImageUrl(doc);
});

// create
productSchema.post('save', (doc) => {
  setImageUrl(doc);
});

//2- Create model
module.exports = mongoose.model('Product', productSchema);
