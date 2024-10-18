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
  {
    timestamps: true,
    // to enable virtual populate
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//Mongoose query midlleware
productSchema.pre(/^find/, function (next) {
  this.populate({ path: 'category', select: 'name _id' });
  this.populate({ path: 'brand', select: 'name _id' });
  next();
});

const setImageUrl = (doc) => {
  const baseUrl = process.env.BASE_URL;

  // Set image cover URL
  if (doc.imageCover) {
    if (!doc.imageCover.startsWith(baseUrl)) {
      const imageUrl = `${baseUrl}/products/${doc.imageCover}`;
      doc.imageCover = imageUrl;
    }
  }

  // Set images URL
  if (doc.images) {
    const imagesList = [];
    doc.images.forEach((image) => {
      if (!image.startsWith(baseUrl)) {
        const imageUrl = `${baseUrl}/products/${image}`;
        imagesList.push(imageUrl);
      } else {
        imagesList.push(image);
      }
    });
    doc.images = imagesList;
  }
};

productSchema.virtual('reviwes', {
  ref: 'Review',
  foreignField: 'product',
  localField: '_id',
});

// findOne , findAll and update
productSchema.post('init', (doc) => {
  if (doc) {
    setImageUrl(doc);
  }
});

// create
productSchema.post('save', (doc) => {
  if (doc) {
    setImageUrl(doc);
  }
});

//2- Create model
module.exports = mongoose.model('Product', productSchema);
