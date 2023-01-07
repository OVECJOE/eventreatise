// dependencies
const { StatusCodes } = require('http-status-codes')

const { message } = require('../utils/globals')
const User = require('../models/user')
const clearStatusMsg = require('../utils/clearStatusMessage')
const Manager = require('../models/manager')

// serve homepage controller
exports.index = async (req, res) => {
  const context = {
    message: null,
    user: req.session.user
  }
  
  // set and clear message
  clearStatusMsg(message, context)
  // render the index page
  return res.render('pages/index', context)
}

// signup controller
exports.signup = async (req, res) => {
  const context = { signup: true }

  // set and clear message
  clearStatusMsg(message, context)

  if (req.method === 'GET') {
    return res.render('pages/auth_form', context)
  }

  // if request method is POST
  try {
    const userExists = await User.findOne({
      email: req.body.email
    })

    if (userExists) {
      message.body = 'Email has already been registered!'
      message.status = StatusCodes.NOT_ACCEPTABLE
    } else {
      // create new user
      const user = await User.create({ ...req.body })
      // add user instance to express session
      req.session.user = user
      // redirect to user's new dashboard
      return res.redirect('/dashboard')
    }
  } catch (err) {
    if (err.name === 'ValidationError') {
      message.body = Object.values(err.errors)[0].message
    } else {
      message.body = err.message
    }
    // set message status
    message.status = StatusCodes.BAD_REQUEST
  }

  return res.redirect('/signup')
}

// login controller
exports.login = async (req, res) => {
  const context = { signup: false, }

  // set and clear message
  clearStatusMsg(message, context)

  if (req.method === 'GET') {
    const { msg, status } = req.query

    message.body = msg ?? message.body
    message.status = status
    // render the authentication form
    return res.render('pages/auth_form', context)
  }

  // On POST request
  const { email, password } = req.body
  const { redirectUrl } = req.query

  try {
    // add user to session if user is found
    const user = await User.login(email, password)
    req.session.user = user

    // set success message
    message.body = `You are successfully logged in, ${user.username}`
    message.status = StatusCodes.OK

    return res.redirect(redirectUrl ?? '/dashboard')
  } catch (err) {
    message.body = err.message
    message.status = StatusCodes.BAD_REQUEST
    // redirect to login again
    return res.redirect('/login')
  }
}

exports.logout = (req, res) => {
  const session = req.session

  if (session.user) {
    session.user = null
    // set message
    message.status = StatusCodes.OK
    message.body = 'You have been logged out from your account; Sign in to access your dashboard.'
  }

  res.redirect('/')
}

exports.view_pricing = async (req, res) => {
  const { user } = req.session

  // data to be sent to the client
  const context = {
    user,
    manager: null
  }

  // set and clear feedback message
  clearStatusMsg(message, context)

  try {
    if (user) {
      context.manager = await Manager.findOne({ user: user._id })
      .populate('cardDetails').exec()
    }
  } catch (err) {
    message.body = err.message
    message.status = StatusCodes.BAD_REQUEST
  }

  // render pricing page
  return res.render('pages/pricing', context)
}
