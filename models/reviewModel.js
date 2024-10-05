const mongoose = require('mongoose');
const Product = require('./productModel');
const reviewSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    ratings: {
      type: Number,
      min: [1, 'min ratings value is 1.0'],
      max: [5, 'max ratings value is 5.0'],
      required: [true, 'Review ratings required'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to user'],
    },
    // parent reference (one to many)
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: [true, 'Review must belong to product'],
    },
  },
  { timestamps: true }
);

reviewSchema.pre(/^find/, function (next) {
  this.populate({ path: 'user', select: 'name' });
  next();
});

reviewSchema.statics.calcAverageRatingsAndQuantity = async function (
  productId
) {
  const result = await this.aggregate([
    // Stage 1 : get all reviwes in specific product
    {
      $match: { product: productId },
    },
    {
      $group: {
        _id: 'productId',
        avgRating: { $avg: '$ratings' },
        ratingsQuntity: { $sum: 1 },
      },
    },
  ]);
  // Stage 2 : Grouping reviwes based on productID and calc avgRating , ratingsQuantity
  if (result.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      ratingsAverage: result[0].avgRating,
      ratingsQuantity: result[0].ratingsQuntity,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      ratingsAverage: 0,
      ratingsQuantity: 0,
    });
  }
};

reviewSchema.post('save', async function () {
  await this.constructor.calcAverageRatingsAndQuantity(this.product);
});

// Use 'findOneAndDelete' hook instead of 'remove'
reviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await doc.constructor.calcAverageRatingsAndQuantity(doc.product);
  }
});

module.exports = mongoose.model('Review', reviewSchema);
