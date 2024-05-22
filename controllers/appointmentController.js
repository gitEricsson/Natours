/* eslint-disable node/no-unsupported-features/es-syntax */
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const Appointment = require('./../models/appointmentModel');
const Tour = require('./../models/tourModel');
const AppError = require('./../utils/appError');

exports.isSoldOut = catchAsync(async (req, res, next) => {
  const appointment = await Appointment.findById(req.body.appointment);

  if (!appointment) {
    return next(
      new AppError(
        "This current appointment doesn't exist. Kindly opt for an alternative appointment.",
        404
      )
    );
  }

  if (appointment.soldOut) {
    return next(
      new AppError(
        'This current appointment is sold out. Kindly opt for an alternative Date.',
        303
      )
    );
  }

  next();
});

exports.updateParticipants = catchAsync(async (req, res, next) => {
  const appointment = await Appointment.findById(
    res.locals.appointment
  ).populate('bookings', { _id: 1, tour: 0, user: 0 });

  const bookingsPerAppointment = appointment.bookings.length;

  const { tour } = res.locals;

  if (bookingsPerAppointment < tour.maxGroupSize) {
    await Appointment.findByIdAndUpdate(res.locals.appointment, {
      participants: bookingsPerAppointment,
      soldOut: false
    });
  }

  if (bookingsPerAppointment === tour.maxGroupSize) {
    await Appointment.findByIdAndUpdate(res.locals.appointment, {
      participants: bookingsPerAppointment,
      soldOut: true
    });
  }

  next();
});

exports.getAppointmentId = catchAsync(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);

  req.body.appointment = booking.appointment;
  req.body.tour = booking.tour;

  next();
});
