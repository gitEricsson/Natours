/* eslint-disable node/no-unsupported-features/es-syntax */
const mongoose = require('mongoose');
const slugify = require('slugify');
const Appointment = require('./appointmentModel');
const { isSoldOut } = require('../controllers/appointmentController');
// const User = require('./userModel');
// const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxLength: [40, 'A tour name must be at most 40 characters'],
      minLength: [10, 'A tour name must be at least 10 characters']
      //validate: [validator.isAlpha, 'Tour name must only contain alpha characters']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, or difficult'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: val => Math.round(val * 10) / 10
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price']
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val) {
          // this only points to current doc on NEW document creation
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price'
      }
    },
    summary: {
      type: String,
      required: [true, 'A tour must have a price']
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      trim: [true, 'A tour must have a cover image']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

// Virtual populate for Parent referencing
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
});

tourSchema.virtual('appointments', {
  ref: 'Appointment',
  foreignField: 'tour',
  localField: '_id'
});

// DOCUMENT MIDDLEWARE: runs before .save() and .create()
tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, {
    lower: true
  });
  next();
});

// tourSchema.pre('save', async function(next) {
//   const guidesPromises = this.guides.map(async id => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

// tourSchema.post('save', function(doc, next) {
//   console.log(doc);
//   next();
// });

// QUERY MIDDLEWARE
// tourSchema.pre('find', function (next) {
tourSchema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true } });

  this.start = Date.now();
  next();
});

// tourSchema.post(/^find/, function(docs, next) {
//   console.log(`Query took ${Date.now() - this.start} milliseconds`);
//   next();
// });

// Populate Normalized Data Model
tourSchema.pre(/^find/, function(next) {
  this.populate({ path: 'guides', select: '-__v -passwordChangedAt' });

  next();
});

// Create Appointment per start Date
tourSchema.post('save', function(doc, next) {
  this.startDates.forEach(el => {
    Appointment.create({ date: el, tour: this._id });
  });

  next();
});

//  If the tour start Dates are patched, update the appointments too
tourSchema.pre(/update/i, async function(next) {
  // this.getUpdate() === this_update
  // includes - array
  // hasOwnProperty - object
  // this.Query() fetches unique keyword(id or name) of query
  const tour = await this.model.findOne(this.getQuery());

  if (
    this._update.hasOwnProperty('startDates') &&
    !(
      JSON.stringify(tour.startDates) ===
      JSON.stringify(this._update.startDates)
    )
  ) {
    // await Appointment.deleteMany({ tour: tour._id });---- I'm commenting this to keep past records of appoitments with regards to the bookings involved

    this._update.startDates.forEach(async el => {
      await Appointment.create({ date: el, tour: tour._id });
    });

    next();
  }

  if (
    this._update.hasOwnProperty('maxGroupSize') &&
    !(+tour.maxGroupSize === +this._update.maxGroupSize)
  ) {
    const appointments = await Appointment.find({ tour: tour._id });

    appointments.forEach(async el => {
      await el.updateOne({
        soldOut: el.participants >= this._update.maxGroupSize ? true : false
      });
    });

    next();
  }

  next();
});

// // AGGREGATION MIDDLEWARE
// tourSchema.pre('aggregate', function(next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   next();
// });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
