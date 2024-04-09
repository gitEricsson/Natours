const express = require('express');
const bookingController = require('./../controllers/bookingController');
const authController = require('./../controllers/authController');
const appointmentController = require('./../controllers/appointmentController');

const router = express.Router();

router.use(authController.protect);

// GET is for an endpoint call without a booking date and generally for a tour, while POST is for an endpoint with one
router
  .route('/checkout-session/:tourId')
  .post(
    appointmentController.isSoldOut,
    bookingController.getCheckoutSession,
    appointmentController.updateParticipants
  );
// .get(
//   appointmentController.isSoldOut,
//   bookingController.getCheckoutSession,
//   appointmentController.updateParticipants
// );

router.use(authController.restrictTo('admin', 'lead-guide'));

router
  .route('/')
  .get(bookingController.getAllBookings)
  .post(
    appointmentController.isSoldOut,
    bookingController.createBooking,
    appointmentController.updateParticipants
  );

router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(
    appointmentController.getAppointmentId,
    bookingController.deleteBooking,
    appointmentController.updateParticipants
  );

module.exports = router;
