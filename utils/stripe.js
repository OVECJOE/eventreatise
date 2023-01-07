const Stripe = require('stripe')

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15"
})

module.exports = stripe