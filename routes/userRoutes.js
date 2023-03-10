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
// view individual space details
router.get('/marketplace/:id', ensureLoggedIn, userController.view_space_details)
// add space to cart
router.get('/cart/add/:spaceId', ensureLoggedIn, userController.add_to_cart)
// view cart
router.get('/cart', ensureLoggedIn, userController.view_cart)
// delete cart item
router.get('/cart/delete/:spaceId', ensureLoggedIn, userController.delete_cart_item)
// delete cart
router.get('/cart/delete', userController.delete_cart)
// view user's profile
router.get('/profile', ensureLoggedIn, userController.view_profile)
// view your followers
router.get('/profile/followers', ensureLoggedIn, userController.view_followers)
// view your following
router.get('/profile/following', ensureLoggedIn, userController.view_following)

module.exports = router