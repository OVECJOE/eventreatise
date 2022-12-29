require('dotenv').config()
require('./config/db_config').connect()
const express = require('express')
const bodyParser = require('body-parser') // parser middleware
const session = require('express-session') // session middleware
const path = require('path')

// initialize server
const app = express()

// port number
const PORT = process.env.PORT ?? 8080
// base routes
const baseRoutes = require('./routes/baseRoutes.js')
// user dashboard routes
const userRoutes = require('./routes/userRoutes')

// set up middlewares
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.json())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60 * 60 * 24 * 1000 } // 1 day
}))
app.use(express.static('uploads'))
app.use(express.static(path.join(__dirname, '/public')))


// set the view engine to EJS
app.set('view engine', 'ejs')

// defining routes
app.use('/', baseRoutes),
app.use('/dashboard', userRoutes)

// server listening
app.listen(PORT, () => {
  console.log(`EvenTreatise server running on PORT ${PORT}...`)
})