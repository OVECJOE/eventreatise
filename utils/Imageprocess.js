// dependencies
const sharp = require('sharp')
const path = require('path')
const { existsSync } = require('fs')
const { mkdir } = require('fs/promises');

const processImg = async (req, dirname, fieldname, mimetype, buffer) => {
  const { user } = req.session
  // create directory if it doesn't exist
  // get file extension
  const ext = mimetype.split('/')[1]
  // generate filename from user id
  const filename = path.join(dirname, `${fieldname}_${user._id}_${Date.now().toString()}.${ext}`)

  // resize and save image
  await sharp(buffer)
    .resize({ width: 480, height: 480 }).sharpen().toFile(`uploads/${filename}`)

  // return filename
  return `http://localhost:${process.env.PORT}/${filename}`
}

module.exports = processImg