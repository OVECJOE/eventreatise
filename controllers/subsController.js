// dependencies
const { StatusCodes, getReasonPhrase } = require('http-status-codes')
// get the initialized stripe object from utils
const stripe = require('../utils/stripe')

// models
const Manager = require('../models/manager')

// get the global message
const { message } = require('../utils/globals')
const clearStatusMsg = require('../utils/clearStatusMessage')

exports.view_sub_plans = async (req, res) => {
  const { user } = req.session

  // data to be sent to the client
  const context = {
    user, prices: null
  }

  try {
    const prices = await stripe.prices.list({
      active: true,
      type: 'recurring',
      currency: 'usd'
    }, {
      apiKey: process.env.STRIPE_SECRET_KEY,
    })

    // add prices to context
    context.prices = prices.data

    // send context as response to client
    return res.send(context)
  } catch (err) {
    message.body = err.message
    message.status = StatusCodes.BAD_REQUEST

    return res.status(message.status).send(message)
  }
}

exports.create_sub_session = async (req, res) => {
  const { user } = req.session
  const { priceId, productName } = req.query

  // data to be sent to the client
  const context = {
    user,
    session: null
  }

  if (!user.isManager) {
    message.status = StatusCodes.FORBIDDEN
    message.body = getReasonPhrase(message.status)

    return res.redirect('/dashboard/profile')
  }

  try {
    // Get manager's details
    const manager = await Manager.findOne({ user: user._id })

    // Create a new stripe session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      success_url: await (async () => {
        // verify manager
        manager.isVerified = true
        await manager.save()
        // set feedback message
        message.body = `You have successfully subscribe to the ${productName.toUpperCase()} plan!`
        message.status = StatusCodes.OK

        return 'http://localhost:8080/dashboard/profile'
      })(),
      cancel_url:(() => {
        message.body = 'You did not complete your subscription process!',
        message.status = StatusCodes.UNPROCESSABLE_ENTITY

        // clear from the global message object
        clearStatusMsg(message, context)

        return 'http://localhost:8080/pricing'
      })(),
      customer: manager.stripeCustomerID
    }, {
      apiKey: process.env.STRIPE_SECRET_KEY,
    })

    return res.send(session)
  } catch (err) {
    console.log(err)
    message.body = err.message
    message.status = StatusCodes.BAD_REQUEST

    return res.status(message.status).send(message)
  }
}