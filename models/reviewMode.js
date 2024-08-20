const mongoose = require('mongoose');
const catchAsync = require('../utils/catchAsync');
const Tour = require('./tourmodel');

const reviewScema = mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'a review must have a description'],
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 1,
      max: 5,
    },
    createAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

reviewScema.index({ tour: 1, user: 1 }, { unique: true });

reviewScema.pre(/^find/, async function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

(reviewScema.statics.calculateAverageRating = async function (tourId) {
  const stats = await this.aggregate([
    { $match: { tour: tourId } },
    {
      $group: {
        _id: '$tour',
        ratingquantity: { $sum: 1 },
        ratingAverage: { $avg: '$rating' },
      },
    },
  ]);
  // console.log(stats);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingAverage: stats[0].ratingAverage,
      ratingquantity: stats[0].ratingquantity,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingAverage: 4.5,
      ratingquantity: 0,
    });
  }
}),
  reviewScema.post('save', function () {
    this.constructor.calculateAverageRating(this.tour);
  });
reviewScema.pre(/findOneAnd/, async function (next) {
  this.r = await this.findOne();
  console.log(this.r);
  next();
});

reviewScema.post(/findOneAnd/, async function () {
  this.r.constructor.calculateAverageRating(this.r.tour);
});

const Review = mongoose.model('Review', reviewScema);
module.exports = Review;
