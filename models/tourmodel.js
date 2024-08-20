const mongoose = require('mongoose');
const slugify = require('slugify');
const tourScema = mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: [true, 'A tour must have a name'],
      minlength: [10, 'tour must have more than 10 characters'],
      maxlength: [40, 'tour must have less than 40 characters'],
    },
    secretTour: {
      type: Boolean,
      default: false,
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a groupsize'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['difficult', 'easy', 'medium'],
        message: 'the allowed difficulty is difficult,easy,medium',
      },
    },
    price: {
      type: Number,
      required: true,
    },
    pricediscout: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: 'discount should be less than price',
      },
    },
    ratingAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'the rate should be more than 1'],
      max: [5, 'the rate should be less than 5'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingquantity: {
      type: Number,
      default: 0,
    },
    discount: Number,
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summery'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a imagecover'],
    },
    images: [String],
    createdat: {
      type: Date,
      default: Date.now(),
    },
    startDates: [Date],
    startLocation: {
      // must have type and coordinates
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

tourScema.virtual('weeklyduration').get(function () {
  return this.duration / 7;
});

tourScema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

tourScema.pre('save', function (next) {
  this.slug = slugify(this.name);
  next();
});

tourScema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  next();
});
tourScema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordchangeat',
  });
  next();
});

// tourScema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   next();
// });

tourScema.index({ price: 1, ratingAverage: -1 });
tourScema.index({ slug: 1 });
tourScema.index({ startLocation: '2dsphere' });

const Tour = mongoose.model('Tour', tourScema);
module.exports = Tour;
