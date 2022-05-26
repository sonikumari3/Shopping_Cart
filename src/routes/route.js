const express = require('express')
const { createProduct, getProductByID, updateProduct, deleteProduct, getAllProducts } = require('../controller/productController')
const { createUser, logIn, findProfile, updateProfile } = require('../controller/userControllers')
const { authentication } = require('../middleware/auth')
const router = express.Router()


//feature 1
router.post('/register', createUser)
router.post('/login', logIn)
router.get('/user/:userId/profile', authentication, findProfile)
router.put('/user/:userId/profile', authentication, updateProfile)

//feature 2

router.post('/products', createProduct)
router.get('/products',getAllProducts)
router.get('/products/:productId', getProductByID)
router.put('/products/:productId', updateProduct)
router.delete('/products/:productId', deleteProduct)


module.exports = router;
