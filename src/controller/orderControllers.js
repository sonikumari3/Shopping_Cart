const { default: mongoose } = require("mongoose")
const order = require("../model/orderModel")
const user = require("../model/userModel")
const cart = require("../model/cartModel")
const { isValid, isValidRequestBody, isValidStatus } = require("../validations/validations")

/**************************************Create Order Api****************************************************/

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

       let {cartId, status, cancellable} = data
       
       if(!cartId){
           return res.status(400).send({status : false, message : "Cart Id is a required field"})
       }

       if(!isValid(cartId)){
           return res.status(400).send({status: false, message : "Cart id is missing in length"})
       }

       if(mongoose.isValidObjectId(cartId)=== false){
           return res.status(400).send({status : false, message : "please provide a valid cartId"})
       }

       if(status){
           if(!isValidStatus(status)){
               return res.status(400).send({status : false, message : " status can only be, 'pending', 'completed' or 'canceled"})
           }
       }

       if(cancellable){
           if(["true", "false"].includes(cancellable) === false){
               return res.status(400).send({status : false, message : "cancellable only take a boolean value"})
           }
       }

       let findCart = await cart.findById({_id : cartId})

       if(!findCart){
           return res.status(404).send({status : false, message : " No cart with this cart id exists"})
       }

       if(findCart.userId != userId){
           return res.status(401).send({status : false, message : "This cart does not belong to you"})
       }

       let totalQuantity = 0;
       for(let i in findCart.items){
           totalQuantity += findCart.items[i].quantity
        }

       let orderData = {
           userId : userId,
           items : findCart.items,
           totalPrice : findCart.totalPrice,
           totalItems : findCart.totalItems,
           totalQuantity : totalQuantity,
           status : status,
           cancellable : cancellable
       }

       let createOrder = await order.create(orderData)
       
       return res.status(201).send({status : true, message : "order created successfully", data : createOrder})

   } catch (error) {
        return res.status(500).send({ status: "error", message: error.message });
   }
} 

/**************************************Update Order Api****************************************************/

const updateOrder = async (req, res)=>{
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
 
        let {orderId, status} = data
        
        if(!orderId){
            return res.status(400).send({status : false, message : "orderId is a required field"})
        }
 
        if(!isValid(orderId)){
            return res.status(400).send({status: false, message : "orderId is missing in length"})
        }
 
        if(mongoose.isValidObjectId(orderId)=== false){
            return res.status(400).send({status : false, message : "please provide a valid orderId"})
        }
 
        if(status){
            if(!isValidStatus(status)){
                return res.status(400).send({status : false, message : " status can only be, 'pending', 'completed' or 'canceled"})
            }
        }
 
        let findorder = await order.findById({_id : orderId})
 
        if(!findorder){
            return res.status(404).send({status : false, message : " No Order with this order id exists"})
        }
 
        if(findorder.userId != userId){
            return res.status(401).send({status : false, message : "This order does not belong to you"})
        }

        if(findorder.isDeleted){
            return res.status(404).send({status : false, message : "deleted orders can't be updated"})
        }

        if(status == 'canceled'){
            if(!findorder.cancellable){
                return res.status(400).send({status : false, message : "this is not a cancellable order"})
            }

        }

        let updateOrder = await order.findOneAndUpdate({userId : userId}, {$set :{status : data.status}}, {new : true}).select({_v: 0})
        
        return res.status(200).send({status : true, message : "order updated successfully", data : updateOrder})
 
    } catch (error) {
         return res.status(500).send({ status: "error", message: error.message });
    }
 }


module.exports = {createOrder, updateOrder}