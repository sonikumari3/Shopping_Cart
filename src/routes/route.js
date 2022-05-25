const express = require('express')
const { createUser, logIn, findProfile, updateProfile } = require('../controller/userControllers')
const { authentication } = require('../middleware/auth')
const router = express.Router()


//feature 1
router.post('/register', createUser)
router.post('/login', logIn)
router.get('/user/:userId/profile', authentication, findProfile)
router.put('/user/:userId/profile', authentication, updateProfile)

module.exports = router;