const express = require('express')
const router = express.Router()

const subsController = require('../controllers/subsController')
const { ensureLoggedIn } = require('../middlewares/auth')

// view subscription plans
router.get('/prices', subsController.view_sub_plans)
// create new stripe session
router.get('/subscribe', ensureLoggedIn, subsController.create_sub_session)

module.exports = router