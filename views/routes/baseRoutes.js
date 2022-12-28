const express = require('express')
const router = express.Router()

const baseController = require('../controllers/baseController')
const { ensureLoggedIn } = require('../middlewares/auth')

// index route
router.get('/', baseController.index)
// signup route
router.route('/signup')
  .get(baseController.signup)
  .post(baseController.signup)
// login route
router.route('/login')
  .get(baseController.login)
  .post(baseController.login)
// logout view
router.get('/logout', ensureLoggedIn, baseController.logout)

module.exports = router