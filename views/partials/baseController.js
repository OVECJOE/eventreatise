const User = require('../models/user')

// serve homepage controller
exports.index = async (req, res) => {
  return res.render('pages/index')
}

// signup controller
exports.signup = async (req, res) => {
  const auth_params = { signup: true, errmsg: '' }

  if (req.method === 'GET') {
    return res.render('pages/auth_form', auth_params)
  }

  try {
    const userExists = await User.findOne({
      email: req.body.email
    })

    if (userExists) {
      auth_params.errmsg = 'Email has already been registered!'
    } else {
      const user = await User.create({ ...req.body })
  
      req.session.user = user
      return res.redirect('/dashboard')
    }
  } catch (err) {
    if (err.name === 'ValidationError') {
      auth_params.errmsg = Object.values(err.errors)[0].message
    } else {
      auth_params.errmsg = err.message
    }
  }

  return res.render('pages/auth_form', auth_params)
}

// login controller
exports.login = async (req, res) => {
  const auth_params = { signup: false, errmsg: '' }

  if (req.method === 'GET') {
    const { errmsg } = req.query

    auth_params.errmsg = errmsg ?? ''
    return res.render('pages/auth_form', auth_params)
  }

  const { email, password } = req.body
  const { redirectUrl } = req.query

  try {
    const user = await User.login(email, password)
    req.session.user = user

    res.redirect(redirectUrl ?? '/dashboard')
  } catch (err) {
    auth_params.errmsg = err.message
    res.render('pages/auth_form', auth_params)
  }
}

exports.logout = (req, res) => {
  const session = req.session

  if (session.user) {
    session.user = null
  }

  res.redirect('/')
}