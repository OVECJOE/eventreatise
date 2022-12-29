// depedencies
const mongoose = require('mongoose')
const { isPostalCode } = require('validator')

const Schema = mongoose.Schema
const { ObjectId } = Schema.Types

/*
  Represents the location of an event centre/venue/space
*/
const SpaceLocation = Schema({
  space: { type: ObjectId, ref: 'EventSpace' },
  country: {
    type: String,
    trim: true,
    required: [true, 'Country where event space is located is required!']
  },
  state: {
    type: String,
    trim: true,
    required: [true, 'State where event space is located is required!']
  },
  city: {
    type: String,
    trim: true,
    required: [true, 'City where event space is located is required!']
  },
  postalCode: {
    type: String,
    trim: true,
    // validate: [isPostalCode, 'Must be a valid postal code!'],
    required: false
  },
  address: {
    type: String,
    required: [true, 'Event space address is required!'],
    trim: true
  }
}, {
  virtuals: {
    location: {
      get() {
        return `${this.city}, ${this.state}, ${this.country}`
      }
    }
  }
})

module.exports = mongoose.model('SpaceLocation', SpaceLocation)