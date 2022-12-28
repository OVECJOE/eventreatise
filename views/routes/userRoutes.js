const express = require('express')
const router = express.Router()

const userController = require('../controllers/userController')
const { ensureLoggedIn } = require('../middlewares/auth')
const upload = require('../middlewares/fileUpload')

// dashboard view
router.get('/', ensureLoggedIn, userController.view_dashboard)
// marketplace for booking venues
router.get('/marketplace', ensureLoggedIn, userController.view_marketplace)
// spaces view
router.get('/spaces', ensureLoggedIn, userController.view_my_spaces)
// create manager account
router.post('/spaces',
  [ensureLoggedIn, upload('managers').single('photo')],
  userController.create_manager)
// view event centre form
router.get('/spaces/create_new', ensureLoggedIn, userController.show_eventspace_form)
// create event space
router.post('/spaces/create_new',
  [ensureLoggedIn, upload('spaces').array('photos', 10)],
  userController.create_space)

module.exports = router