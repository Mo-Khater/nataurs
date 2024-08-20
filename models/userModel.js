const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const userSchema = mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  name: {
    type: String,
    required: [true, 'a User must have a name'],
  },
  email: {
    type: String,
    required: [true, 'a User must have an email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'please provide a valid email'],
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  password: {
    type: String,
    required: [true, 'User must have a password'],
    minlength: [7, 'password should be more then 7 chars'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    // required: [true, 'User must confirm the password'],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "they don't match",
    },
  },
  passwordchangeat: Date,
  passwordResetToken: String,
  passwordResetTokenexpired: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordchangeat = Date.now() - 1000;
  next();
});
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;

  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.matchPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.checkifuserchangepassword = (jwtiat) => {
  if (this.passwordchangeat) {
    const passwordchangeat = parseInt(
      this.passwordchangeat.getTime() / 1000,
      10,
    );
    return jwtiat < passwordchangeat;
  }
  return false;
};

userSchema.methods.createtokentoresetpassword = function (req, res, next) {
  const token = crypto.randomBytes(32).toString('hex');
  const hashedtoken = crypto.createHash('sha256').update(token).digest('hex');

  this.passwordResetToken = hashedtoken;
  this.passwordResetTokenexpired = Date.now() + 50 * 60 * 1000;

  return token;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
