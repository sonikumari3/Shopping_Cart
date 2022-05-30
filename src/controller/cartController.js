const { default: mongoose } = require('mongoose')
const { isValid, isValidRequestBody,isValidObjectId  } = require('../validations/validations')
const product = require('../model/productModel')
const user = require('../model/userModel')
const cart = require('../model/cartModel')
const cartModel = require('../model/cartModel')

const createCart = async (req, res) => {
    try {
        let userId = req.params.userId
        let tokenId = req.userId
        const body = req.body
        // const {items} =items
        const {productId, quantity } = body
        
 // Valid user or not 
 if (userId != tokenId) {
    
    return res.status(401).send({ status: false, message: "You are not authorized" })
}
        //validation 
        if (!isValidRequestBody(req.body)) {
            return res.status(400).send({ status: false, message: "Please provided input in body" })
        }
       
        if (!isValid(userId)) {
            return res.status(400).send({ status: false, message: "user id is missing in length" })
        }
        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "Please provide valid User Id" })
        }

        if (!isValid(productId)) {
            return res.status(400).send({ status: false, message: "Product id is missing in length" })
        }
        
        if (!mongoose.isValidObjectId(productId)) {
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
        console.log(findUser)
        if (!findUser) {
            return res.status(404).send({ status: false, message: "User Id not present" })
        }
        const findProduct = await product.findOne({ _id: productId, isDeleted: false })
        if (!findProduct) {
            return res.status(404).send({ status: false, message: "Product is deleted" })
        }
const findCart = await cart.findOne({ userId: userId }) 

if (!findCart) {

    //destructuring for the response body.
    var data= {
        userId: userId,
        items: [{
            productId: productId,
            quantity: quantity,
        }],
        totalPrice: findProduct.price * quantity,
        // totalItems: items.length
        totalItems: 1
    }

    const createCart = await cart.create(data)
    return res.status(201).send({ status: true, message: "Cart created successfully", data: createCart })
}   

}
    catch (error) {
        console.log(error)
        return res.status(500).send({ status: false, message: error.message })
    }
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

const getCart = async function (req, res) {
    try {
        const userId = req.params.userId;
        let tokenId = req.userId

         // Authentication & authorization
         if (userId != tokenId) {
            res.status(401).send({ status: false, message: "Unauthorized access! User's info doesn't match" });
            return
        }

        // validation starts
        if (!mongoose.isValidObjectId(userId)) {
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

       
        const findCart = await cart.findOne({ userId: userId })

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

const deleteCart = async function (req, res){

    try {
        const userId= req.params.userId

        let tokenId= req.userId

        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "Please provide valid User Id" })
        }

          const findUser = await userModel.findById(userId)
          if (!findUser){
             return res.status(400).send({status: false,message:"User does not exist"})
          }

          if (userId != tokenId) {
            res.status(401).send({ status: false, message: "Unauthorized access! User's info doesn't match" });
            return
        }

          const findCart = await cartModel.findOne({userId:userId})
              if (!findCart){
                  return res.status(400).send({status: false,message:"No cart Found"})
              }

              const deletedCart= await cartModel.findOneAndUpdate({userId:userId},{$set:{items:[],totalItems:0,totalprice:0}},{new:true})
                 return res.status(200).send({status:true, message: "All items in cart deleted Successfully",data:deletedCart}) 

               } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
         }
        }



module.exports = { createCart, getCart , deleteCart }