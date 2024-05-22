/* eslint-disable node/no-unsupported-features/es-syntax */
const Tour = require('./../models/tourModel');
const Booking = require('./../models/bookingModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');
const axios = require('axios');
const AppError = require('../utils/appError');
// const got = require('got');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);
  if (!tour) {
    return next(
      new AppError(
        'This current Tour is no longer available. Kindly opt for an alternative Tour.',
        404
      )
    );
  }

  // 2) Create checkout session
  const response = await axios({
    method: 'POST',
    url: 'https://api.flutterwave.com/v3/payments',
    data: {
      tx_ref: `${req.user.id}-${req.params.tourId}-${
        req.body.appointment
      }-${Date.now()}`,
      amount: tour.price * 100,
      currency: 'NGN',
      redirect_url: `https://natours-6ybv.onrender.com/confirmBooking`,
      // redirect_url: `https://www.flutterwave.com`,
      //   redirect_url: `${req.protocol}://${req.get('host')}/`,
      meta: {
        consumer_id: req.params.tourId
      },
      customer: {
        email: req.user.email,
        name: req.user.name
      },
      customizations: {
        title: `${tour.name} Tour`,
        logo: `https://www.natours.dev/img/tours/${tour.imageCover}`,
        description: tour.summary
      }
      //   payment_options: 'card'
    },
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.FLUTTER_SECRET_KEY}`
    }
  });

  /*
  const response = await got
    .post('https://api.flutterwave.com/v3/payments', {
      headers: {
        Authorization: `Bearer ${process.env.FLUTTER_SECRET_KEY}`
      },
      json: {
        tx_ref: `${req.user.id}-${req.params.tourId}-${Date.now()}`,
        amount: tour.price * 1000,
        currency: 'NGN',
        redirect_url: `https://www.flutterwave.com`,
        // redirect_url: `${req.protocol}://${req.get('host')}/`,
        meta: {
          consumer_id: req.params.tourId
        },
        customer: {
          email: req.user.email,
          name: req.user.name
        },
        customizations: {
          title: `${tour.name} Tour`,
          logo: `https://www.natours.dev/img/tours/${tour.imageCover}`,
          description: tour.summary
        },
        // payment_options: 'card'
      }
    })
    .json();
    */

  // 3) Create session as response
  res.status(200).json({
    status: 'success',
    response: response.data
  });

  /*
  // 3) Create session as response -- got request
  res.status(200).json({
    status: 'success',
    response
  });
  */
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  const ref = req.query.tx_ref.split('-');
  const userId = ref[0];
  const tourId = ref[1];
  const appointmentId = ref[2];

  const tour = await Tour.findById(tourId);
  res.locals.tour = tour;
  res.locals.appointment = appointmentId;

  if (req.query.status === 'successful') {
    const { price } = tour;

    await Booking.create({
      user: userId,
      tour: tourId,
      appointment: appointmentId,
      price
    });
  }

  next();
});

exports.isBooked = catchAsync(async (req, res, next) => {
  const bookingsCount = await Booking.countDocuments(
    { user: req.user.id, tour: req.params.tourId },
    function(err, count) {
      return count;
    }
  );

  if (bookingsCount < 1) {
    return next(
      new AppError('You can not review a tour you have not booked.', 401)
    );
  }

  next();
});

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
