const express = require('express');
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

const router = express.Router();

router.get('/', authController.isLoggedIn, viewController.getOverview); // bookingController.createBookingCheckout before authController.isLoggedIn

router.get('/tour/:slug', authController.isLoggedIn, viewController.getTour);

router.get('/signup', authController.isLoggedIn, viewController.getSignupForm);

router.get(
  '/confirmSignup',
  authController.isLoggedIn,
  viewController.getConfirmSignupForm
);

router.get('/login', authController.isLoggedIn, viewController.getLoginForm);

router.get(
  '/confirmLogin',
  authController.isLoggedIn,
  viewController.getConfirmLoginForm
);

router.get('/me', authController.protect, viewController.getAccount);

router.get('/my-tours', authController.protect, viewController.getMyTours);

router.get(
  '/appointments/:slug',
  authController.isLoggedIn,
  viewController.getAppointmentsList
);

// WITHOUT API
// router.post(
//   '/submit-user-data',
//   authController.protect,
//   viewController.updateUserData
// );

module.exports = router;
