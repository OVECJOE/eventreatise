// dependencies
const multer = require('multer') // uploading files

const uploadPhoto = (dirname) => {
  // setup multer for storing uploaded files
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, `uploads/${dirname}`)
    },
    filename: (req, file, cb) => {
      const ext = file.originalname.split('.')[1]
      cb(null, `${file.fieldname}-${Date.now().toString()}.${ext}`)
    }
  })
  
  const upload = multer({ storage })

  return upload
}

module.exports = uploadPhoto