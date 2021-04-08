
const path = require('path')
const fs = require('fs').promises
const multer = require('multer')


const uploadDir = path.join(process.cwd(), 'tmp')
const storageDir = path.join(process.cwd(), 'public', 'avatars')

const uploadOptions = multer.diskStorage({
  destination: (req, file, cb)=> {
    cb(null, uploadDir )
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  },
  
})

const upload = multer({
  storage: uploadOptions,
  limits: {
    fileSize: 2000000
  },
  fileFilter: (req, file, cb) => {
      if (file.mimetype.includes('image'))
   { 
       cb(null, true)
       return
    } 
    cb(null, false)
  }
})


module.exports =  upload
