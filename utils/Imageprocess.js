// dependencies
const sharp = require('sharp')
const path = require('path')

const processImg = async (req, dirname, fieldname, originalname, buffer) => {
  const { user } = req.session

  // generate filename from user id
  const filename = path.join(`${dirname}`,
    `${fieldname}_${user._id}.${originalname.split('.')[1]}`)

  // resize and save image
  await sharp(buffer)
    .resize({ width: 240, height: 320 }).sharpen().toFile(filename)
  
  // return filename
  return filename
}

module.exports = processImg