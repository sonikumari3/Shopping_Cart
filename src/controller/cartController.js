const { default: mongoose } = require('mongoose')
const { isValid, isValidRequestBody, isValidObjectId } = require('../validations/validations')
const product = require('../model/productModel')
const user = require('../model/userModel')
const cart = require('../model/cartModel')

const createCart = async (req, res) => {
    try {
        let userId = req.params.userId
        let tokenId = req.userId
        let body = req.body
        const { quantity, productId } = body
        console.log(productId)

        //validation 
        if (!isValidRequestBody(body)) {
            return res.status(400).send({ status: false, message: "Please provided input in body" })
        }
        console.log(userId)
        if (!isValid(userId)) {
            return res.status(400).send({ status: false, message: "user id is missing in length" })
        }
        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "Please provide valid User Id" })
        }

        if (!isValid(productId)) {
            return res.status(400).send({ status: false, message: "Product id is missing in length" })
        }
        console.log(productId)
        if (!isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "Product id is required to do this action" })
        }
        if (!isValid(quantity)) {
            return res.status(400).send({ status: false, message: "Quantity is missing in length" })

        }
        if (quantity < 1) {
            return res.status(400).send({ status: false, message: "Please provide quantity" })

        }
        // find in Db    
        const findUser = await user.findById({ _id: userId })
        if (!findUser) {
            return res.status(404).send({ status: false, message: "User Id not present" })
        }
        console.log(findUser)

        // Valid user or not 
        
        if (findUser._id.toString() !== tokenId) {
            console.log(findUser._id)
            console.log(tokenId)

            return res.status(401).send({ status: false, message: "You are not authorized" })
        }



        const findProduct = await product.findOne({ _id: productId, isDeleted: false })
        if (!findProduct) {
            return res.status(404).send({ status: false, message: "Product is deleted" })
        }

        let findCart = await cart.findOne({ _id: userId })
        if (!findCart) {
           
            var data = {
                userId: userId,
                items: [{
                    productId: productId,
                    quantity: quantity,
                }],
                totalPrice: findProduct.price * quantity,
                totalItems: items.length 
            }

            const createCart = await cart.create({ data })
            return res.status(201).send({ status: true, message: 'Cart created successfully', data: createCart })
        }
    }
    catch (error) {
        console.log(error)
        return res.status(500).send({ status: false, message: error.message })
    }
}

const getCart = async function (req, res) {
    try {
        const userId = req.params.userId;
        let tokenId = req.userId

        //validation starts
        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "Invalid userId in params." })
        }
        //validation ends

        const findUser = await userModel.findById({ _id: userId })
        if (!findUser) {
            return res.status(400).send({
                status: false,
                message: "User doesn't exists "
            })
        }

        //Authentication & authorization
        if (findUser._id.toString() != tokenId) {
            res.status(401).send({ status: false, message: "Unauthorized access! User's info doesn't match" });
            return
        }

        const findCart = await cartModel.findOne({ userId: userId })

        if (!findCart) {
            return res.status(400).send({
                status: false,
                message: "Cart doesn't exists"
            })
        }

        return res.status(200).send({ status: true, message: "Successfully fetched cart.", data: findCart })

    } catch (error) {
        console.log(error)
        return res.status(500).send({ status: false, message: error.message })
    }
}


module.exports = { createCart, getCart }