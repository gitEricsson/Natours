const mongoose = require('mongoose');
const crypto = require('crypto');

const tokenSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Confirmation Mail must belong to a User!']
  },
  signupToken: String,
  signinToken: String,
  refreshToken: [String]
});

tokenSchema.methods.createSignupToken = function() {
  const signupToken = crypto.randomBytes(32).toString('hex');

  this.signupToken = crypto
    .createHash('sha256')
    .update(signupToken)
    .digest('hex');

  console.log(this);

  return signupToken;
};

tokenSchema.methods.createSigninToken = function() {
  this.signinToken = Math.floor(Math.random() * 899999 + 100000);

  return this.signinToken;
};

const Token = mongoose.model('Token', tokenSchema);
module.exports = Token;
