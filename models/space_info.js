// dependencies
const mongoose = require('mongoose')
// const {} = require('validator')

const Schema = mongoose.Schema
const { ObjectId } = Schema.Types

// level enum type
const RATINGLEVELTYPE = ['None', 'Basic', 'Good', 'Excellent']

/*
  Represents an EventSpaceInfo instance
  EventSpaceInfo: Contains more information about an event space.
  This is used with EventSpace, by the manager, to clear doubts of customers.
*/
const EventSpaceInfo = Schema({
  space: { type: ObjectId, ref: 'EventSpace' },
  ps: { type: Boolean, default: false, alias: 'parkingSpace' }, // parking space
  pss: { type: Number, default: 0, alias: 'parkingSpaceSize' }, // parking space size
  ventilation: {
    type: String,
    enum: RATINGLEVELTYPE,
    default: RATINGLEVELTYPE[0]
  },
  restroom: { type: Boolean, default: false },
  ss: {
    type: String,
    enum: RATINGLEVELTYPE,
    default: RATINGLEVELTYPE[0],
    alias: 'soundSystem'
  }, // sound system type,
  ls: {
    type: String,
    enum: RATINGLEVELTYPE,
    default: RATINGLEVELTYPE[0],
    alias: 'lightSystem'
  }, // light system
  isEasilyAccessible: { type: Boolean, default: true },
  securityStatus: {
    type: String,
    enum: RATINGLEVELTYPE,
    default: RATINGLEVELTYPE[0]
  },
  size: { type: Number, default: 0 }, // represents the space area in sqr. metres
  furnitureCount: { type: Number, default: 0 } // Number of furniture (chairs and tables)
}, {
  virtuals: {
    // represents the percentage of space that is unfilled by the furniture
    unfilled: {
      get() {
        const unfilledRatio = this.furnitures / this.size
        return `${unfilledRatio * 100}%`
      }
    }
  }
})

module.exports = mongoose.model('EventSpaceInfo', EventSpaceInfo)