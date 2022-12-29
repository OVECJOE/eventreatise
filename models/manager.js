// dependencies
const mongoose = require('mongoose')
const { isMobilePhone } = require('validator')

const Schema = mongoose.Schema
const { ObjectId } = Schema.Types

/*
  Represents a Manager instance
  Manager: A user with the ability to advertise/manage event spaces/venues.
  Managers make venues available for users in need of it
*/
const Manager = new Schema({
  user: { type: ObjectId, ref: 'User' },
  isVerified: { type: Boolean, default: false },
  phoneNumber: {
    type: String,
    validate: [isMobilePhone, 'Please enter a valid phone number!'],
    unique: [true, 'This phone number is already in use by another manager.'],
  },
  photo: { type: String, trim: true },
  eventSpaces: [
    { type: ObjectId, ref: 'EventSpace' }
  ],
  followers: [
    { type: ObjectId, ref: 'User' }
  ]
}, { timestamps: { createdAt: 'joined', updatedAt: 'lastLogin' } })

module.exports = mongoose.model('Manager', Manager)