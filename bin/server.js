const app= require('../app')
const path = require('path')
const db = require('../db/index')
const fs = require('fs').promises
require('dotenv').config()
const PORT = process.env.PORT || 3000

const uploadDir = path.join(process.cwd(), 'tmp')
//const UPLOAD_DIR = path.join(process.cwd(), process.env.UPLOAD_DIR)
const storageDir = path.join(process.cwd(), 'public', 'avatars')

const isAccessible = (path) => {
  return fs
    .access(path)
    .then(() => true)
    .catch(() => false)
}

const createFolderIsNotExist = async (folder) => {
  if (!(await isAccessible(folder))) {
    await fs.mkdir(folder)
  }
}

db.then(()=> {
  app.listen(PORT, async () => {
    await createFolderIsNotExist(uploadDir)
    await createFolderIsNotExist(storageDir)
    console.log(`Server running. Use our API on port: ${PORT}`)
  })
}).catch((err)=> {
  console.log(`Server not running.Error message: ${err.message}`);
})


