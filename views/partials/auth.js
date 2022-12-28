const User = require('../models/user');

const ensureLoggedIn = async (req, res, next) => {
  const { session, originalUrl } = req

  if (!session.user) {
    return res.redirect('/login?redirectUrl=' + originalUrl)
  }

  session.user = await User.findById(session.user._id)
    .select('-password');
  next();
};

module.exports = {
  ensureLoggedIn,
};