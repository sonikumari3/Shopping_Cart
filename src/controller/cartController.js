const { default: mongoose } = require('mongoose')
const { isValid, isValidRequestBody,  } = require('../validations/validations')
const product = require('../model/productModel')
const user = require('../model/userModel')
const cart = require('../model/cartModel')

const createCart = async (req, res) => {
    try {
       let userId = req.params.userId
       let TokenId = req.userId
       let data = req.body
       const productId = req.body.items[0].productId
       const quantity = req.body.items[0].quantity
       
       if(!isValidRequestBody(data)){
           return res.status(400).send({status : false, message : "No imput has been provided"})
       }
       
       if(!userId){
           return res.status(400).send({status : false, message : "user Id Must be provided to do this action"})
       }

       if(!isValid(userId)){
           return res.status(400).send({status : false, message : "user id is missing in length"})
       }

       if(mongoose.isValidObjectId(userId) === false){
           return res.status(400).send({status : false, message : "Please provide a valid user ID"})
       }

       if(TokenId !== userId){
        return res.status(401).send({status : false, message: "You are not authorized to do this action"})
       }

       let findUser = await user.findById({_id : userId})

       if(!findUser){
           return res.status(404).send({status : false, message :"the user does not exists"})
       }

       if(!productId){
           return res.status(400).send({status : false, message : "Product id is a required field"})
       }
       if(!isValid(product)){
           return res.status(400).send({status : false, message : "Product id is missing in length"})
       }
       if(mongoose.isValidObjectId(productId)=== false){
           return res.status(400).send({status : false, message : "Please provide a valid Product id"})
       }

       let findpro = await product.findById({_id : productId})

       if(!findpro){
           return res.status(404).send({status : false, message : "This product does not exists"})
       }

       if(findpro.isDeleted){
           return res.status(404).send({status : false, message : "This is a deleted product and can't be ordered"})
       }

       if(!quantity){
           return res.status(400).send({status : false, message : "product quantity is needed"})
       }

       if(!isValid(quantity)){
           return res.status.send({status : false, message : "The quantity is missing in length"})
       }

       if(isNaN(quantity)){
           return res.status.send({status : false, message : "The quantity must be a number"})
       }

       if(quantity<1){
           return res.status(400).send({status : false, message : "quanity must be 1 or above"})
       }

       let findcart = await cart.findOne({userId : userId})

       if(!findcart){
        let TotalItem = items.length
        let TotalPrice = findpro.price * items[0].quantity
        let {items} = data
        let cartData = { 
            items: items, 
            totalPrice: TotalPrice, 
            totalItems: TotalItem, 
            userId: userId 
        }
        
        let createCart = await cart.create(cartData)
        return res.status(201).send({ status: true, message: "success", data: createCart })
       }
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////






const getCart = async function (req, res) {
    try {
        const userId = req.params.userId;
        let tokenId = req.userId

        //validation starts
        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "Invalid userId in params." })
        }
        //validation ends

        const findUser = await user.findById({ _id: userId })
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