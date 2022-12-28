// dependencies
const mongoose = require('mongoose')
// const {} = require('validator')

const Schema = mongoose.Schema
const { ObjectId } = Schema.Types

/*
  Represents an EventSpace instance
  EventSpace: Refers to any place/space dedicated to make events happen.
  They can only be created by managers
*/

const EventSpace = Schema({
  manager: { type: ObjectId, ref: 'Manager' },
  name: {
    type: String,
    maxLength: 200,
    required: [true, 'Venue name is required!'],
    trim: true
  },
  desc: {
    type: String,
    maxLength: 3000,
    trim: true,
    required: [true, 'Venue description is important!'],
    alias: 'description'
  },
  location: { type: ObjectId, ref: 'SpaceLocation' },
  photos: [
    { data: Buffer, contentType: String }
  ],
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  booked: { type: Boolean, default: false },
  refundable: { type: Boolean, default: true },
  category: { type: ObjectId, ref: 'SpaceCategory' },
  maxCapacity: { type: Number, default: 0 }, // maximum number of people it can house.
  // Additional info about an event space goes to EventSpaceInfo
  moreInfo: { type: ObjectId, ref: 'EventSpaceInfo' }
})

module.exports = mongoose.model('EventSpace', EventSpace)