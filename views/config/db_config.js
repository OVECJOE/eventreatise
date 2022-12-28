const mongoose = require('mongoose')

exports.connect = () => {
  mongoose.set('strictQuery', true)

  mongoose.connect(process.env.MONGO_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  }).then((res) => {
    console.log(`Successfully connected to ${res.connection.host}...`)
  }).catch((err) => {
    console.log('Database connection failed. Exiting now...')
    console.log(`Error: ${err.message}`)
    process.exit(1)
  })
}