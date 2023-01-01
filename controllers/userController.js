// dependencies
const { Country, State, City } = require('country-state-city')
const { StatusCodes, getReasonPhrase } = require('http-status-codes')

// models
const SpaceCategory = require('../models/space_category')
const EventSpace = require('../models/space')
const Manager = require('../models/manager')
const User = require('../models/user')
const SpaceLocation = require('../models/space_location')
const SpaceInfo = require('../models/space_info')
const Cart = require('../models/cart')

const processImg = require('../utils/Imageprocess')
const likeOrDislike = require('../utils/likeOrDislike')
const clearStatusMsg = require('../utils/clearStatusMessage')

// get the message global
const { message } = require('../utils/globals')

exports.view_dashboard = async (req, res) => {
  const context = {
    user: req.session.user,
    followingCount: 0,
    availableSpaces: 0,
    cartSize: 0
  }
  // get user's cart
  const cart = await Cart.findOne({ user: context.user._id })

  // set and clear message
  clearStatusMsg(message, context)

  context.followingCount = context.user.following.length
  context.availableSpaces = await EventSpace.find({ booked: false }).countDocuments()
  context.cartSize = cart.noOfSpaces

  return res.render('pages/dashboard', context)
}

exports.view_marketplace = async (req, res) => {
  const { category } = req.query
  // data to be sent to the client
  const context = {
    user: req.session.user,
    categories: null,
  }

  // add to context and clear message
  clearStatusMsg(message, context)

  try {
    // filter by category
    const filter = (category && category !== 'all') ? {
      name: { $regex: new RegExp(category, 'i') }
    } : {}

    const spaceCategories = await SpaceCategory.find(filter)
      .populate({
        path: 'eventSpaces',
        populate: {
          path: 'manager', populate: {
            path: 'user'
          }
        }
      }).exec()

    context.categories = spaceCategories
  } catch (err) {
    message.status = StatusCodes.BAD_REQUEST
    message.body = getReasonPhrase(message.status)
    // redirect on error
    return res.redirect('/dashboard/marketplace')
  }

  return res.render('pages/marketplace', context)
}

exports.view_my_spaces = async (req, res) => {
  const { user } = req.session

  // data to be sent to the client
  const context = {
    user,
    spaces: null,
  }

  // add to context and clear message
  clearStatusMsg(message, context)

  if (user?.isManager) {
    try {
      // get the manager details
      const manager = await Manager.findOne({ user: user._id })
      // get the event spaces for the given manager id
      const eventSpaces = await EventSpace.find({ manager: manager._id })
        .select(['-photos', '-desc'])
        .populate(['manager', 'location', 'category']).exec()

      context.spaces = eventSpaces
    } catch (err) {
      // set feedback message
      message.status = StatusCodes.BAD_REQUEST
      message.body = getReasonPhrase(message.status)
      return res.redirect('/dashboard/spaces')
    }
  }

  return res.render('pages/my_spaces', context)
}

exports.create_manager = async (req, res) => {
  const { phoneNumber } = req.body
  const { user } = req.session

  try {
    // process image
    const { fieldname, mimetype, buffer } = req.file
    // get photo link
    const photo = await processImg(req, 'managers', fieldname, mimetype, buffer)

    // create manager
    const manager = await Manager.create({
      user: user._id,
      phoneNumber,
      photo
    })

    // set the isManager to true
    req.session.user = await User.findByIdAndUpdate(user._id,
      { isManager: true }, { new: true }).exec()

    // set success message
    message.body = `Account successfully created, though unverified! New manager id is ${manager._id}`
    message.status = StatusCodes.CREATED
    return res.redirect('/dashboard/spaces')
  } catch (err) {
    // set error message
    message.body = err.message
    message.status = StatusCodes.BAD_REQUEST
    // redirect back to my spaces
    return res.redirect('/dashboard/spaces')
  }
}

exports.show_eventspace_form = async (req, res) => {
  // data to be sent to client
  const context = {
    user: req.session.user,
    countries: Country.getAllCountries(),
    states: State.getAllStates(),
    cities: City.getAllCities(),
    categories: null
  }

  // clear message information
  clearStatusMsg(message, context)

  // redirect to dashboard if not manager
  if (!context.user.isManager) {
    message.body = 'You are not authorized to view this page!'
    message.status = StatusCodes.NOT_FOUND
    return res.redirect('/dashboard')
  }

  // get all categories
  context.categories = await SpaceCategory.find({})

  return res.render('pages/space_form', context)
}

exports.create_space = async (req, res) => {
  const { user } = req.session
  const { formType } = req.body

  // when form type is category, create new category
  if (formType === 'category') {
    const { name, desc } = req.body

    try {
      const category = await SpaceCategory.create({
        name, desc
      })
      message.body = `Successfully created category: ${category.name}`
      message.status = StatusCodes.CREATED
    } catch (err) {
      message.body = err.message
      message.status = StatusCodes.BAD_REQUEST
    }

    // redirect to same URL: GET
    return res.redirect('/dashboard/spaces/create_new')
  }

  // when form type is space, create new event space
  if (formType === 'space') {
    const {
      name, category, desc, country,
      state, city, postalCode, address
    } = req.body

    // data for the creation of the event space
    const spaceData = {
      photos: [], // list of photos of event spaces
      name, desc,
      category: category.replace(' ', ''),
    }

    try {
      for (const file of req.files) {
        // get some metadata information from each file
        const { fieldname, mimetype, buffer } = file
        // process and save photo; generate photo URL
        const photo = await processImg(req, 'spaces', fieldname, mimetype, buffer)
        // add photo URL to the list of space photo
        spaceData.photos.push(photo)
      }

      // create the event space
      const space = await EventSpace.create(spaceData)
      // create space location too
      const sl = await SpaceLocation.create({
        space: space._id,
        country, state, city,
        address, postalCode
      })

      // assign location id to space
      space.location = sl._id

      // get extra detail about the event space
      const {
        parkingSpace, parkingSpaceSize, size, furnitureCount,
        ventilation, soundSystem, lightSystem, securityStatus
      } = req.body

      // create the data object for the extra details
      const moreSpaceDetails = {
        parkingSpace: parkingSpace ? parkingSpace : false,
        parkingSpaceSize: parkingSpace ? parkingSpaceSize : 0,
        size, furnitureCount, ventilation, soundSystem, lightSystem,
        securityStatus
      }
      // create a SpaceInfo instance that stores this information
      if (!Object.values(moreSpaceDetails).every(value => !value)) {
        const spaceInfo = await SpaceInfo.create({
          space: space._id,
          ...moreSpaceDetails
        })
        // assign moreInfo id to space
        space.moreInfo = spaceInfo._id
      }

      // get manager info
      const manager = await Manager.findOneAndUpdate({ user: user._id }, {
        $addToSet: { eventSpaces: space._id }
      }, { new: true })

      // add manager id to space
      space.manager = manager._id
      // update the space category to reflect the new event space created
      await SpaceCategory.updateOne({ _id: space.category._id }, {
        $addToSet: { eventSpaces: space._id },
      }, { new: true })

      // save to database
      await space.save()
      // update the message object
      message.body = 'Event Space Created Successfully; What a name you have made for yourself!'
      message.status = StatusCodes.CREATED
    } catch (err) {
      message.body = err.message
      message.status = StatusCodes.BAD_REQUEST
      return res.redirect('/dashboard/spaces/create_new')
    }
  }

  // redirect to my spaces URL
  return res.redirect('/dashboard/spaces')
}

exports.view_space_details = async (req, res) => {
  const { id } = req.params
  const { action } = req.query
  // data to be sent to the client
  const context = {
    user: req.session.user,
    space: null,
    eventSpaces: null,
    cart: null
  }

  // set and clear feedback message
  clearStatusMsg(message, context)

  try {
    // get space by id and increment views by 1
    const space = await EventSpace.findById(id).populate([
      'location', 'category', 'moreInfo']).populate({
        path: 'manager',
        populate: 'user'
      }).exec()
    // get event spaces in the same category
    const eventSpaces = await EventSpace.find({
      category: space.category._id,
      _id: { $ne: space._id }
    })

    // get user's cart
    const cart = await Cart.findOne({ user: context.user._id })
    // add it to the context
    context.cart = cart

    context.eventSpaces = eventSpaces

    if (!space.viewsList.includes(context.user._id)) {
      space.views += 1
      space.viewsList.push(context.user._id)
      await space.save()
    }

    if (action === 'like') {
      // like event space
      likeOrDislike(space, context.user, space.likesList,
        space.dislikesList, action)
    } else if (action === 'dislike') {
      // dislike event space
      likeOrDislike(space, context.user, space.dislikesList,
        space.likesList, action)
    }

    if (action) {
      return res.redirect('/dashboard/marketplace/' + id)
    }

    context.space = space
    return res.render('pages/eventspace', context)
  } catch (err) {
    message.status = StatusCodes.BAD_REQUEST
    message.body = getReasonPhrase(message.status)
    // redirect to the marketplace
    return res.redirect('/dashboard/marketplace')
  }
}

exports.add_to_cart = async (req, res) => {
  const { spaceId } = req.params
  const { user } = req.session

  try {
    // get space price
    const space = await EventSpace.findById(spaceId, 'name price')

    if (!space) {
      message.body = 'Cannot add space to cart; Space not found!'
      message.status = StatusCodes.BAD_REQUEST
    } else {
      // check if cart already exist
      let cart = await Cart.findOne({ user: user._id })

      if (!cart) {
        cart = await Cart.create({
          user: user._id,
          noOfSpaces: 1,
          totalPrice: space.price.value,
          eventSpaces: [space._id]
        })

        message.body = `${space.name} added to your newly created cart. Visit "My Cart" to view.`
        message.status = StatusCodes.CREATED
      } else {
        const idx = cart.eventSpaces.indexOf(space._id)

        if (idx === -1) {
          cart.noOfSpaces += 1
          cart.totalPrice += space.price.value
          cart.eventSpaces.push(space._id)

          await cart.save()

          // set success message
          message.body = `${space.name} added to cart. Visit "My Cart" to view added item.`
          message.status = StatusCodes.OK
        } else {
          message.body = `${space.name} already added to cart. Visit "My Cart" to view!`
          message.status = StatusCodes.CONFLICT
        }
      }
    }
  } catch (err) {
    message.body = err.message
    message.status = StatusCodes.BAD_REQUEST
  }

  // redirect to the original URL
  return res.redirect(`/dashboard/marketplace/${spaceId}`)
}

exports.view_cart = async (req, res) => {
  const { user } = req.session

  // data to be sent to the client
  const context = {
    user, cart: null,
  }

  // set and clear message
  clearStatusMsg(message, context)

  try {
    const cart = await Cart.findOne({ user: user._id })
      .populate({
        path: 'eventSpaces',
        populate: 'category'
      }).exec()
    
    // add cart to context
    context.cart = cart
  } catch (err) {
    message.body = err.message
    message.status = StatusCodes.BAD_REQUEST
    // redirect to dashboard home
    return res.redirect('/dashboard')
  }

  // render page
  return res.render('pages/cart', context)
}
