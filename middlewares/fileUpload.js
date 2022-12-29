// dependencies
const multer = require('multer') // uploading files
const fs = require('fs')

const uploadPhoto = (dirname) => {
  // setup multer for storing uploaded files
  const storage = multer.memoryStorage()
  // create the middleware object
  const upload = multer({ storage })
  
  // create folder if it doesn't exist
  fs.access(`uploads/${dirname}`, err => {
    if (err) {
      fs.mkdirSync(`uploads/${dirname}`)
    }
  })
  return upload
}

module.exports = uploadPhoto