const { StatusCodes } = require('http-status-codes');
const User = require('../models/user');
const { message } = require('../utils/globals');

const ensureLoggedIn = async (req, res, next) => {
  const { session, originalUrl } = req

  if (!session.user) {
    message.body = 'Your session has expired; Login to continue!'
    message.status = StatusCodes.FORBIDDEN
  
    return res.redirect('/login?redirectUrl=' + originalUrl)
  }

  session.user = await User.findById(session.user._id)
    .select('-password');
  next();
};

module.exports = {
  ensureLoggedIn,
};