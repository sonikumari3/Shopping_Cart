const { default: mongoose } = require("mongoose")
const order = require("../model/orderModel")
const user = require("../model/userModel")
const cart = require("../model/cartModel")
const { isValid, isValidRequestBody } = require("../validations/validations")


const createOrder = async (req, res)=>{
   try{
       let userId = req.params.userId
       let tokenId = req.userId

       if(!isValid(userId)){
           return res.status(400).send({status : false, messsage : "user Id is missing in length"})
       }

       if(!mongoose.isValidObjectId(userId)){
           return res.status(400).send({status : false, message : "Please provide a valid user Id"})
       }

       let findUser = await user.findById({_id : userId})
       if(findUser){
           if(tokenId != userId){
               return res.status(401).send({status : false, message :"you are unauthorized to do this"})
           }
       }else{
           return res.status(404).send({status : false, message : "No user with this id exists"})
       }

       let data = req.body

       if(!isValidRequestBody(data)){
           return res.status(400).send({status : false, message : "No input has been provided"})
       }

       let cartId = data.cartId
       
       if(!cartId){
           return res.status(400).send({status : false, message : "Cart Id is a required field"})
       }

       if(!isValid(cartId)){
           return res.status(400).send({status: false, message : "Cart id is missing in length"})
       }

       if(mongoose.isValidObjectId(cartId)=== false){
           return res.status(400).send({status : false, message : "please provide a valid cartId"})
       }

       let findCart = await cart.findById({_id : cartId})

       if(!findCart){
           return res.status(404).send({status : false, message : " No cart with this cart id exists"})
       }

       let orderData = {
           userId : userId,
           items : findCart.items,
           totalPrice : findCart.totalPrice,
           totalItems : findCart.totalItems,
           totalQuantity : findCart.items.quantity
       }

       let createOrder = await order.create(orderData)
       
       return res.status(201).send({status : true, message : "order created successfully", data : createOrder})
       
   } catch (error) {
        return res.status(500).send({ status: "error", message: error.message });
   }
} 
module.exports = {createOrder}