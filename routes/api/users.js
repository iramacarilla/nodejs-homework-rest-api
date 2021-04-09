const express = require('express');
const router = express.Router();
const userControllers = require('../../controllers/users');
const guard = require('../../helpers/guard')
const upload = require('../../helpers/multer')

router.get('/current', guard, userControllers.current) 
router.patch('/', guard, userControllers.updateSub) 
router.patch("/avatars", guard, upload.single('avatar'), userControllers.avatars)

module.exports = router
