// dependencies
const mongoose = require('mongoose')

const Schema = mongoose.Schema
const { ObjectId } = Schema.Types

// Introducing the event space category
const SpaceCategory = Schema({
  name: {
    type: String,
    unique: [true, 'A category with given name already exists!'],
    required: [true, 'Category name is required!'],
    trim: true,
    maxLength: 50
  },
  desc: {
    type: String,
    maxLength: 300,
    trim: true,
  },
  isActive: { type: Boolean, default: true },
  eventSpaces: [
    { type: ObjectId, ref: 'EventSpace' }
  ]
})

module.exports = mongoose.model('SpaceCategory', SpaceCategory)