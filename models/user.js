// dependencies
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const { isEmail, isStrongPassword } = require('validator')

// create model
const Schema = mongoose.Schema
const { ObjectId } = Schema.Types

const User = new Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required!'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required!'],
    trim: true
  },
  username: {
    type: String,
    unique: true,
    required: [true, 'Username is required!'],
    minLength: 3,
    maxlength: 12,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    unique: [true, 'Email address already registered!'],
    required: [true, 'Email address is required!'],
    validate: [isEmail, 'Please fill in a valid email address'],
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'Password is required for authentication!'],
    validate: [
      isStrongPassword,
      'Password must be 8 characters minimum; Must contain 1 uppercase, lowercase, digit, special character (at least)'
    ],
    unique: true,
  },
  isManager: { type: Boolean, default: false },
  following: [
    { type: ObjectId, ref: 'Manager' }
  ]
}, {
  timestamps: { createdAt: 'joined', updatedAt: 'lastLogin' },
  virtuals: {
    fullName: {
      get() {
        return `${this.firstName} ${this.lastName}`
      }
    }
  }
})

// hash password
User.pre('save', async function (next) {
  const salt = await bcrypt.genSalt();

  this.password = await bcrypt.hash(this.password, salt)
  next()
})

// comparing password on login
User.statics.login = async function (email, password) {
  const u = await this.findOne({ email }).select('+password')

  if (u) {
    const auth = await bcrypt.compare(password, u.password)

    if (auth) {
      return u
    }

    throw Error('Incorrect Password!')
  }

  throw Error('User with given email does not exist!')
}

module.exports = mongoose.model('User', User)