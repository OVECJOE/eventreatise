// dependencies
const mongoose = require('mongoose')
const { isCreditCard } = require('validator')

const Schema = mongoose.Schema

const ManagerCard = new Schema({
  cardNumber: {
    type: String,
    required: [true, 'Your card number is required!'],
    trim: true,
    validate: [isCreditCard, 'Card number provided is invalid!'],
    unique: true
  },
  expiryDate: {
    month: {
      type: Number,
      max: 12,
      min: 1,
      required: [true, 'Month of expiry must be provided!']
    },
    year: {
      type: Number,
      required: [true, 'Year of expiry must be provided!']
    }
  },
  cvv: {
    type: Number,
    min: 000, max: 999,
    required: [true, 'Please provide your card CVV']
  },
  country: {
    type: String,
    required: [true, 'Country or region is required!'],
    trim: true
  },
  zipcode: {
    type: Number,
    required: [true, 'Zipcode is required!']
  }
})