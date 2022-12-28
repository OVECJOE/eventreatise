// dependencies
const mongoose = require('mongoose')

const Schema = mongoose.Schema
const { ObjectId } = Schema.Types

// Reviews done by users that booked an event centre
const Review = Schema({
  type: {
    type: String,
    enum: ['Space', 'Manager'],
    default: 'Space',
    alias: 'reviewType'
  },
  spaceId: { type: ObjectId, ref: 'EventSpace' },
  userId: { type: ObjectId, ref: 'User' },
  rating: { type: Number, default: 0, max: 5 },
  body: {
    type: String,
    maxLength: 300,
    trim: true,
    required: [true, 'Content must be provided!']
  }
})

module.exports = mongoose.model('Review', Review)