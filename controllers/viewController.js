/* eslint-disable node/no-unsupported-features/es-syntax */
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Bookings = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) Get tour data from collection
  const tours = await Tour.find();

  // 2) Build template
  // 3) Render that template using tour data from 1)
  res.status(200).render('overview', {
    title: 'All Tours',
    tours
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // 1) Get the data, for the requested tour (including reviews and guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user'
  });

  if (!tour) {
    return next(new AppError('There is no tour with that name.', 404));
  }

  // 2) Build template

  // 3) Render that template using data from 1)
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour
  });
});

exports.getSignupForm = (req, res) => {
  // 1) Render that template using data from 1)
  res.status(200).render('signup', {
    title: `Create an account`
  });
};

exports.getConfirmSignupForm = (req, res) => {
  // 1) Render that template using data from 1)
  res.status(200).render('confirmSignup', {
    title: `Confirm Signup`
  });
};

exports.getLoginForm = (req, res) => {
  // 1) Render that template using data from 1)
  res.status(200).render('login', {
    title: `Log into your account`
  });
};

exports.getConfirmLoginForm = (req, res) => {
  // 1) Render that template using data from 1)
  res.status(200).render('confirmLogin', {
    title: `Confirm Login`
  });
};

exports.getAccount = (req, res) => {
  // 1) Render that template using data from 1)
  res.status(200).render('account', {
    title: `Your account`
  });
};

exports.getMyTours = catchAsync(async (req, res, next) => {
  // 1) Find all bookings
  const bookings = await Bookings.find({ user: req.user.id });

  // 2) Find tours with the returned IDs
  const tourIDs = bookings.map(el => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIDs } });

  res.status(200).render('overview', {
    title: 'My Tours',
    tours
  });
});

// WITHOUT API
// exports.updateUserData = catchAsync(async (req, res, next) => {
//   console.log('yes');
//   const updatedUser = await User.findByIdAndUpdate(
//     req.user.id,
//     {
//       name: req.body.name,
//       email: req.body.email
//     },
//     {
//       new: true,
//       runValidators: true
//     }
//   );

//   res.status(200).render('account', {
//     title: `Your account`,
//     user: updatedUser
//   });
// });

exports.getAppointmentsList = catchAsync(async (req, res, next) => {
  // 1) Get the data, for the requested tour (including reviews and guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'appointments',
    fields: 'date'
  });

  if (!tour.appointments[0]) {
    return next(new AppError('There is no appointment for this Tour.', 404));
  }

  // 2) Build template

  // 3) Render that template using data from 1)
  res.status(200).render('appointments', {
    title: `List of Appointments`,
    tour
  });
});
