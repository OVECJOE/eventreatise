// dependencies
const fs = require('fs')
const path = require('path')
const { Country, State, City } = require('country-state-city')

const SpaceCategory = require('../models/space_category')
const EventSpace = require('../models/space')
const Manager = require('../models/manager')
const User = require('../models/user')
const SpaceLocation = require('../models/space_location')
const SpaceInfo = require('../models/space_info')
const processImg = require('../utils/Imageprocess')
const likeOrDislike = require('../utils/likeOrDislike')

// global variables
const message = {
  errmsg: '',
  success_msg: ''
}

setTimeout(() => {
  if (Object.values(message).length > 0) {
    message.errmsg = ''
    message.success_msg = ''
  }
}, 4000)

exports.view_dashboard = async (req, res) => {
  const context = {
    user: req.session.user,
    followingCount: 0,
    availableSpaces: 0
  }

  context.followingCount = context.user.following.length
  context.availableSpaces = await EventSpace.find({ booked: false }).countDocuments()

  return res.render('pages/dashboard', context)
}

exports.view_marketplace = async (req, res) => {
  const { category } = req.query
  // data to be sent to the client
  const context = {
    user: req.session.user,
    categories: null,
    ...message
  }

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
    message.errmsg = err.message
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
    ...message
  }

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
      message.errmsg = err.message
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

    console.log(`Successfully created manager! ID: ${manager._id}`)

    // set the isManager to true
    req.session.user = await User.findByIdAndUpdate(user._id,
      { isManager: true }, { new: true }).exec()

    const success_msg = 'A manager\'s account has been created, though not yet verified. You can go ahead and post event spaces though.'
    message.success_msg = success_msg
    return res.redirect('/dashboard/spaces')
  } catch (err) {
    message.errmsg = err.message
    return res.redirect('/dashboard/spaces')
  }
}

exports.show_eventspace_form = async (req, res) => {
  // data to be sent to client
  const context = {
    user: req.session.user,
    ...message,
    countries: Country.getAllCountries(),
    states: State.getAllStates(),
    cities: City.getAllCities(),
    categories: null
  }


  // redirect to dashboard if not manager
  if (!context.user.isManager) {
    return res.redirect('/dashboard')
  }

  // get all categories
  context.categories = await SpaceCategory.find({})

  return res.render('pages/space_form', context)
}

exports.create_space = async (req, res) => {
  const { user } = req.session
  const { formType } = req.body

  // check formType
  if (formType === 'category') {
    const { name, desc } = req.body

    try {
      const category = await SpaceCategory.create({
        name, desc
      })
      message.success_msg = `Successfully created category: ${category.name}`
      return res.redirect('/dashboard/spaces/create_new')
    } catch (err) {
      message.errmsg = err.message
      return res.redirect('/dashboard/spaces/create_new')
    }
  } else if (formType === 'space') {
    const {
      name, category, desc, country,
      state, city, postalCode, address
    } = req.body

    // event space data
    const spaceData = {
      photos: [], // list of photos of event spaces
      name, desc,
      category: category.replace(' ', ''),
    }

    try {
      for (const file of req.files) {
        // get image path
        const { fieldname, mimetype, buffer } = file
        const photo = await processImg(req, 'spaces', fieldname, mimetype, buffer)

        spaceData.photos.push(photo)
      }

      // create the event space
      const space = await EventSpace.create(spaceData)

      const sl = await SpaceLocation.create({
        space: space._id,
        country, state, city,
        address, postalCode
      }) // space location

      // assign location id to spacec
      space.location = sl._id

      // get more details about event space
      const {
        parkingSpace, parkingSpaceSize, size, furnitureCount,
        ventilation, soundSystem, lightSystem, securityStatus
      } = req.body

      const moreSpaceDetails = {
        parkingSpace: parkingSpace ? parkingSpace : false,
        parkingSpaceSize: parkingSpace ? parkingSpaceSize : 0,
        size, furnitureCount, ventilation, soundSystem, lightSystem,
        securityStatus
      }

      if (!Object.values(moreSpaceDetails).every(value => !value)) {
        const spaceInfo = await SpaceInfo.create({
          space: space._id,
          ...moreSpaceDetails
        })

        space.moreInfo = spaceInfo._id
      }

      // get manager info
      const manager = await Manager.findOneAndUpdate({ user: user._id }, {
        $addToSet: { eventSpaces: space._id }
      }, { new: true })

      space.manager = manager._id

      await SpaceCategory.updateOne({ _id: space.category._id }, {
        $addToSet: { eventSpaces: space._id },
      }, { new: true })

      // save to database
      await space.save()
      return res.redirect('/dashboard/spaces')
    } catch (err) {
      message.errmsg = err.message
      return res.redirect('/dashboard/spaces/create_new')
    }

  }
}

exports.view_space_details = async (req, res) => {
  const { id } = req.params
  const { action } = req.query
  // data to be sent to the client
  const context = {
    user: req.session.user,
    space: null,
    eventSpaces: null,
    ...message
  }

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
    message.errmsg = err.message
    return res.redirect('/dashboard/marketplace')
  }
}
