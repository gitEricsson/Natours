<!-- PROJECT LOGO -->
<br />
<div align="center">
  <!-- <a href="https://ericsson-mapty.netlify.app/"> -->
    <img src="./public/img/logo-green-small.png" alt="Logo" height="75">
    
  </a>

# Natours

</div>

## Table of contents

- [Overview](#overview)
  - [About](#about)
  - [The Challenge](#the-challenge)
  - [Features](#features)
  - [Updates](#updates)
  - [Links](#links)
- [My process](#my-process)
  - [Keys](#keys)
  - [Built with](#built-with)
- [Author](#author)
- [Acknowledgments](#acknowledgments)

## Overview

### About

Natours is a real-world RESTful API alongside a server-side rendering WebApp for booking Tours.

### The Challenge

My goal was to recreate [Jonas Schmedtmann's](https://github.com/jonasschmedtmann) Natours WebApp from scratch and make some updates to it.

Some of the challenges I faced along the way were:

- Integrating [Flutterwave](https://developer.flutterwave.com) in place of Stripe due to accessibility issues
- Replacing [Leaflet](https://leafletjs.com/index.html) with Mapbox as the later is now a premium tool
- Implementing [Brevo](https://developers.brevo.com) in place of Sendgrid due to SignUp problems encountered
- Executing my project on [Render](https://render.com/) instead of Heroku as the free-to-deploy plan isn't available anymore
- Bainstorming the UI design, Application Logic, and Business Logic for the updates

### Features

#### API - Backend

- RESTful API- REST Architecture
- CRUD(Create, Read, Update, Delete) operations on API
- Creating, reading, updating, and deleting tours on the database
- Creating, reading, updating, and deleting bookings on the database
- Creating, reading, updating, and deleting reviews on the database
- Creating, reading, updating, and deleting users on the database
- 'Top 5 Cheap Tours', 'Monthly Plan', 'Tour Stats', 'Tours within Radius', and 'Distances to Tours from a Point' endpoints
- 'Password Reset', 'Forgot Password', and 'Update Current User Password' endpoints
- User Authentication with JWT
- User Authorization and Permission: Admin, Lead-Guide, Guide, User (OAuth 2.0)
- User input data validation
- Password encryption with salt and hash (bcrypt)
- Password reset token encryption (SHA 256)
- User input data sanitization
- Halt login requests using bcrypt
- Rate-limiting implementation (express-rate-limit)
- Special HTTP headers (helmet package)
- Body payload limitation (in body-parser)
- Evil regular expressions avoidance
- JWT storage in HTTPOnly cookies
- Mongoose for MongoDB (because of SchemaTypes)
- Random password reset tokens with expiry dates
- Access to JWT after password change denial
- Proper error handling functionality
- Global error handler Implementation
- Parameter Pollution Prevention
- Proper Data Modelling: Child, Parent, and Two-Way Referencing
- Geospatial queries
- Geospatial Aggregation
- API documentation using [Postman](https://www.postman.com)
- Mailing System using [Nodemailer](https://www.nodemailer.com) and [Mailtrap](https://mailtrap.io)(for development and testing)
- Image uploads using [Multer](https://www.npmjs.com/package/multer)

#### WebApp - Frontend

- Error page rendering
- Login Feature
- Logout Feature
- Reset Password Interface
- Tour cards display
- All Tours page
- Individual Tour page: Review section, Map section, Tour details section, and Booking section
- User settings
- User Profile
- Booked Tours page
- Update user data page
- Upload profile picture feature

### Updates

- Responsive Web Design across all Devices
- Display or hide Mobile Menu Functionality
- Cross-Site Request Forgery (csurf package) prevention
- Re-authentication before a high-value action
- Blacklist of untrusted JWTs Implementation
- User Email Address Confirmation after Signup
- Keep Users logged in with Refresh tokens
- Two-factor Authentication per Login Implementation on both Front and Back ends
- Automatic Focus and Navigation pin confirmation feature (UI and UX considerations)
- Restriction that users can only review a tour that they have actually booked
- Nested booking routes: /tours/:id/bookings and /users/:id/bookings
- Improved tour dates: The Tour now includes 'participants' and a 'soldOut' field for each date in the DB, allowing users to select a date and check if the tour is still available before booking on both Front and Back ends
- Booking Payment System using [Flutterwave](https://developer.flutterwave.com) in place of Stripe
- Mailing Sytem using [Brevo](https://developers.brevo.com)(for production) instead of Sendgrid
- Tour Location and Map Feature using [Leaflet](https://leafletjs.com/index.html) in lieu of Mapbox
- Signup form Implementation
- Checkout session for booking an appointment
- Update no of participants after each booking confirmation

### Links

- Code URL: [Github Repo here](https://github.com/gitEricsson/Natours)
- Live Site URL: [Live site here](https://natours-6ybv.onrender.com)

## My process

### Keys

You can use any of the keys below to make a card mock payment or get more from [Flutter's API documentation](https://developer.flutterwave.com/docs/integration-guides/testing-helpers/#cards)

| Type                            | Card number         | CVV | PIN  | Expiry | OTP   |
| :------------------------------ | :------------------ | :-- | :--- | :----- | :---- |
| MasterCard PIN authentication   | 5531886652142950    | 564 | 3310 | 09/32  | 12345 |
| Verve Card PIN authentication 2 | 5061460166976054667 | 564 | 3310 | 10/29  | -     |
| Visa Card 3DS authentication    | 4187427415564246    | 828 | 3310 | 09/35  | 12345 |

### Built with

- Semantic HTML5 markup
- CSS custom properties
- Flexbox
- CSS Grid
- JavaScript
- MVC Architecture
- AJAX
- API
- NodeJS
- REST Architecture
- Express
- Mongoose
- MongoDB Atlas
- Pug
- JSON Web Token
- ParcelJS
- Flutterwave
- Postman
- Mailtrap
- Brevo
- Nodemailer
- Leaflet
- Axios
- bcrypt
- dotenv
- got
- Helmet
- hpp
- html-to-text
- xss-clean
- Slugify
- Sharp
- Morgan
- Multer
- express-rate-limit
- Nodemon

## Author

- Website - [Ericsson Raphael](https://github.com/gitEricsson)
- LinkedIn - [@ericsson](www.linkedin.com/in/ericssonraphael)
- Gmail - [@ericsson](ericssonraphael@gmail.com)

## Acknowledgments

[Jonas Schmedtmann](https://github.com/jonasschmedtmann)
