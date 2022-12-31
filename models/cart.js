// dependencies
const mongoose = require('mongoose')

const Schema = mongoose.Schema
const { ObjectId } = Schema.Types

// Represents a user's cart where event space are added until time of order
const Cart = Schema({
  user: { type: ObjectId, ref: 'User' },
  noOfSpaces: { type: Number, default: 0 },
  totalPrice: { type: Number, default: 0 },
  eventSpaces: [
    { type: ObjectId, ref: 'EventSpace' }
  ]
}, {
   timestamps: ['createdAt', 'updatedAt']
})

module.exports = mongoose.model('Cart', Cart)