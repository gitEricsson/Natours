/* eslint-disable node/no-unsupported-features/es-syntax */

const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Email = require('./../utils/email');
const Token = require('./../models/tokenModel');

const signToken = (id, token) => {
  if (token === 'ACCESS')
    return jwt.sign({ id }, process.env.JWT_ACCESS_SECRET, {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN
    });

  if (token === 'REFRESH')
    return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN
    });
};

// const signToken = id => {
//   return jwt.sign({ id }, process.env.JWT_SECRET, {
//     expiresIn: process.env.JWT_EXPIRES_IN
//   });
// };

const createSendToken = catchAsync(async ({ req, res, user, statusCode }) => {
  const accessToken = signToken(user._id, 'ACCESS');
  const newRefreshToken = signToken(user._id, 'REFRESH');

  const userRefreshTokens = await Token.findOne({ user: user._id });

  const accessCookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_ACCESS_COOKIE_EXPIRES_IN * 1000
    ),
    httpOnly: true
  };

  const refreshCookieOptions = {
    expires: new Date(
      Date.now() +
        process.env.JWT_REFRESH_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    refreshCookieOptions.secure = true;
    accessCookieOptions.secure = true;
  }

  // Saving refreshToken with current user
  // userRefreshTokens.refreshToken = newRefreshTokenArray
  //   ? [...newRefreshTokenArray, newRefreshToken]
  //   : [newRefreshToken];

  // await userRefreshTokens.save();

  if (!userRefreshTokens) {
    const token = await Token.create({
      user: user._id
    });

    token.refreshToken = [newRefreshToken];

    await token.save();
  }

  if (userRefreshTokens) {
    userRefreshTokens.refreshToken = [
      ...userRefreshTokens.refreshToken,
      newRefreshToken
    ];

    await userRefreshTokens.save();
  }

  // Creates Secure Cookie with refresh token
  res.cookie('accessJwt', accessToken, accessCookieOptions);
  res.cookie('refreshJwt', newRefreshToken, refreshCookieOptions);

  user.password = undefined;

  // Send authorization roles and access token to user
  res.status(statusCode).json({
    status: 'success',
    token: accessToken,
    data: {
      user
    }
  });
});
// const createSendToken = (user, statusCode, res) => {
//   const token = signToken(user._id);

//   const cookieOptions = {
//     expires: new Date(
//       Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
//     ),
//     httpOnly: true
//   };

//   if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

//   res.cookie('jwt', token, cookieOptions);

//   user.password = undefined;

//   res.status(statusCode).json({
//     status: 'success',
//     token,
//     data: {
//       user
//     }
//   });
// };

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    active: false
  });

  //  Create newUser token to confirm E-mail
  const token = await Token.create({
    user: newUser._id
  });

  const signupToken = token.createSignupToken();
  await token.save();

  try {
    const confirmURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v4/users/confirmEmail/${signupToken}`;

    await new Email(newUser, confirmURL).sendConfirmSignup();

    res.status(200).json({
      status: 'success',
      message: 'Confirmation Link sent to email!'
    });
  } catch (err) {
    await User.deleteOne({ _id: newUser._id });
    await Token.findByIdAndDelete(token._id);

    return next(
      new AppError(
        'There was an error sending the email. Please Try Signing up again later!',
        500
      )
    );
  }
});

exports.confirmSignup = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.signupToken)
    .digest('hex');

  const token = await Token.findOne({
    signupToken: hashedToken
  });

  if (!token) {
    return next(new AppError('Confirmation Link is invalid', 400));
  }

  // 2) If there is user, activate the account
  const update = await User.updateOne({ _id: token.user }, { active: true });
  const user = await User.findById(token.user);

  if (!user) {
    return next(new AppError('Confirmation Link is invalid', 400));
  }

  // update the user to active
  token.signupToken = undefined;
  await token.save();

  const url = `${req.protocol}://${req.get('host')}/me`;
  await new Email(user, url).sendWelcome();

  createSendToken({ req: req, res: res, user: user, statusCode: 201 });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(
      new AppError('Please provide a valid email and password!', 400)
    );
  }
  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Invalid email or password', 401));
  }

  // // 3) If everything ok, send token to client -- if we weren't confirming login
  // createSendToken({ req: req, res: res, user: user, statusCode: 200 });

  //  Create newUser token to confirm E-mail
  let token;
  token = await Token.findOne({
    user: user._id
  });

  if (!token) {
    token = await Token.create({
      user: user._id
    });
  }

  const signinToken = token.createSigninToken();
  await token.save();

  try {
    await new Email(user, signinToken).sendConfirmSignin();

    res.status(200).json({
      status: 'success',
      message: 'Confirmation Link sent to email!',
      data: {
        email: user.email
      }
    });
  } catch (err) {
    return next(
      new AppError(
        'There was an error sending the email. Please Try again!',
        500
      )
    );
  }
});

exports.confirmLogin = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const user = await User.findOne({ email: req.body.email });

  const token = await Token.findOne({
    user: user._id
  });

  if (!+token.signinToken === +req.body.signinToken) {
    return next(new AppError('Pin is invalid', 400));
  }

  // 2) Update the user to active
  token.signinToken = undefined;
  await token.save();

  createSendToken({ req: req, res: res, user: user, statusCode: 200 });
});

exports.logout = catchAsync(async (req, res) => {
  const cookies = req.cookies;

  if (cookies.accessJwt)
    res.clearCookie('accessJwt', {
      httpOnly: true,
      sameSite: 'None',
      secure: true
    });

  if (!cookies?.refreshJwt)
    return res.status(204).json({ status: 'No content' }); //No content
  const refreshToken = cookies.refreshJwt;

  // Is refreshToken in db?
  const foundUser = await Token.findOne({ refreshToken });
  if (!foundUser) {
    res.clearCookie('refreshJwt', {
      httpOnly: true,
      sameSite: 'None',
      secure: true
    });
    return res.status(204).json({ status: 'No content' });
  }

  // Delete refreshToken in db
  foundUser.refreshToken = foundUser.refreshToken.filter(
    rt => rt !== refreshToken
  );
  await foundUser.save();

  res.clearCookie('refreshJwt', {
    httpOnly: true,
    sameSite: 'None',
    secure: true
  });

  res.status(200).json({ status: 'success' });
});

exports.refreshToken = catchAsync(async (req, res, next) => {
  const cookies = req.cookies;
  if (!cookies?.refreshJwt) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 407)
    );
  }

  const refreshToken = cookies.refreshJwt;

  res.clearCookie('refreshJwt', {
    httpOnly: true,
    sameSite: 'None',
    secure: true
  });

  const foundUser = await Token.findOne({ refreshToken });

  // Detected refresh token reuse!
  if (!foundUser) {
    try {
      decoded = await promisify(jwt.verify)(
        refreshToken,
        process.env.JWT_REFRESH_SECRET
      );

      const hackedUser = await Token.findOne({ user: decoded.id });
      hackedUser.refreshToken = [];
      await hackedUser.save();
    } catch (err) {
      return new AppError(
        'You are not logged in! Please log in to get access.',
        407
      );
    }
    return new AppError('Detected refresh token reuse!', 403); //Forbidden
  }

  const newRefreshTokenArray = foundUser.refreshToken.filter(
    rt => rt !== refreshToken
  );

  // evaluate jwt
  try {
    decoded = await promisify(jwt.verify)(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );

    // Refresh token was still valid
    const accessToken = signToken(foundUser.user, 'ACCESS');
    const newRefreshToken = signToken(foundUser.user, 'REFRESH');

    // Saving refreshToken with current user
    foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];
    await foundUser.save();

    const accessCookieOptions = {
      expires: new Date(
        Date.now() + process.env.JWT_ACCESS_COOKIE_EXPIRES_IN * 1000
      ),
      httpOnly: true
    };

    const refreshCookieOptions = {
      expires: new Date(
        Date.now() +
          process.env.JWT_REFRESH_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
      ),
      httpOnly: true
    };

    if (process.env.NODE_ENV === 'production') {
      refreshCookieOptions.secure = true;
      accessCookieOptions.secure = true;
    }

    res.cookie('accessJwt', accessToken, accessCookieOptions);
    res.cookie('refreshJwt', newRefreshToken, refreshCookieOptions);

    res.status(200).json({
      status: 'success',
      token: accessToken
    });
  } catch (err) {
    foundUser.refreshToken = [...newRefreshTokenArray];
    await foundUser.save();
    throw err;
    // return new AppError('Expired Refresh Token. Kindly Log in again!', 403); //Forbidden
  }
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check if it's there
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.accessJwt) {
    token = req.cookies.accessJwt;
  }

  if (!token && req.cookies.refreshJwt) {
    return next(
      new AppError('You are not logged in! Access token expired.', 401)
    );
  }

  if (!token || token === 'null') {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  // 2) Access verification token
  let decoded;

  try {
    decoded = await promisify(jwt.verify)(token, process.env.JWT_ACCESS_SECRET);
  } catch (err) {
    if (err.message === 'jwt expired') {
      return next(
        new AppError('You are not logged in! Access token expired.', 401)
      );
    }

    throw err;
  }

  // 3) Check if the user still exists
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401
      )
    );
  }

  // 4) Check if user changed password after the token was issued
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = freshUser;
  res.locals.user = freshUser;
  next();
});

exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.refreshJwt) {
    try {
      // 1) Refresh Verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.refreshJwt,
        process.env.JWT_REFRESH_SECRET
      );

      // 2) Check if the user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser; // almost like the render function, but in this case, every pug template has access to the current user data.
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

exports.restrictTo = (...roles) => {
  //   ...roles = 'admin', 'lead-guide'; roles = ['admin', 'lead-guide']; role = 'user'
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with email address.', 404));
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email address
  try {
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v4/users/resetPassword/${resetToken}`;

    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!'
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending the email. Try again later!',
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) UpdatechangedPasswordAt property for the user in the usermodel
  // 4) Log the user in, send JWT
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const { passwordCurrent } = req.body;

  // !) Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // 2) Check if POSTed current password is correct
  if (!(await user.correctPassword(passwordCurrent, user.password))) {
    return next(new AppError('Invalid password!', 401));
  }

  // 3) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // 4) Log user in, send JWT
  createSendToken(user, 200, res);
});
