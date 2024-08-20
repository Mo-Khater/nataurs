const { promisify } = require('util');
const crypto = require('crypto');
const User = require('./../models/userModel');
const jwt = require('jsonwebtoken');
const appError = require('../utils/appError');
const catchasync = require('../utils/catchAsync');
const sendEmail = require('../utils/email');
const app = require('../app');
const generateJWT = (id) => {
  token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWt_EXPIRATION,
  });
  return token;
};

exports.logout = (req, res, next) => {
  res.cookie('jwt', 'anything', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    status: 'success',
  });
};
const createandsenttoken = (res, user) => {
  token = generateJWT(user._id);
  const optionsObj = {
    expires: new Date(
      Date.now() + process.env.JWt_cookie_expiresin * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV == 'production') optionsObj.secure = true;

  user.password = undefined;
  user.active = undefined;
  res.cookie('jwt', token, optionsObj);
  console.log(token);
  res.status(201).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchasync(async (req, res, next) => {
  const newuser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
  });

  createandsenttoken(res, newuser);
});
exports.login = catchasync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(new appError('please enter email and password', 400));
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password, user.password)))
    return next(new appError('wrong email or password', 401));

  createandsenttoken(res, user);
});

exports.protect = catchasync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(new appError('you are not login', 401));
  }

  //verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET); // check for valid signure using the secret and valid expired date

  //check if user exist
  const user = await User.findById(decoded.id);
  if (!user) return next(new appError("the user doens't exist", 401));

  // check if user change his password
  if (user.checkifuserchangepassword(decoded.iat))
    return next(new appError('user has change password recently', 401));
  res.locals.user = user;
  req.user = user;
  next();
});

exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      //verification token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET,
      ); // check for valid signure using the secret and valid expired date

      //check if user exist
      const user = await User.findById(decoded.id);
      if (!user) return next();

      // check if user change his password
      if (user.checkifuserchangepassword(decoded.iat)) return next();
      console.log(user);
      res.locals.user = user;
    } catch (err) {
      return next();
    }
  }
  next();
};

exports.restrictto = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new appError('you are not permitted to do this', 403));
    }
    next();
  };
};

exports.forgetpassword = catchasync(async (req, res, next) => {
  // get user with this specified email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new appError('no user with this email address', 404));
  }

  // create token for the user
  const randomtoken = user.createtokentoresetpassword();
  await user.save({ validateBeforeSave: false });

  // send token by email
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetpassword/${randomtoken}`;
  const message = `${resetURL}`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'reset password',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'send mail success',
    });
  } catch {
    user.passwordResetToken = undefined;
    user.passwordResetTokenexpired = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new appError('send email goes wrong', 500));
  }
});

exports.resetpassword = catchasync(async (req, res, next) => {
  const hashedtoken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedtoken,
    passwordResetTokenexpired: { $gt: Date.now() },
  });

  if (!user) {
    return next(new appError('invalid or expired token'));
  }
  (user.password = req.body.password),
    (user.passwordConfirm = req.body.passwordConfirm);
  user.passwordResetToken = undefined;
  user.passwordResetTokenexpired = undefined;

  await user.save();

  createandsenttoken(res, user);
});

exports.updatePassword = catchasync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');
  const { password } = req.body;
  if (!(await user.matchPassword(password, user.password))) {
    return next(new appError("the password you entered isn't correct", 401));
  }

  user.password = req.body.currentpassword;
  user.passwordConfirm = req.body.passwordConfirm;
  user.save();

  createandsenttoken(res, user);
});
