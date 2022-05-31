const { default: mongoose } = require('mongoose')
const { isValid, isValidRequestBody, } = require('../validations/validations')
const product = require('../model/productModel')
const user = require('../model/userModel')
const cart = require('../model/cartModel')

/**************************************Create Cart Api****************************************************/

const createCart = async (req, res) => {
    try {
       let userId = req.params.userId
       let TokenId = req.userId
       let data = req.body
       const productId = req.body.items[0].productId
       const quantity = req.body.items[0].quantity
       let {items} = data
       
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
       if(!isValid(productId)){
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

       if(quantity<=1){
           return res.status(400).send({status : false, message : "quanity must be 1 or above"})
       }

       let findcart = await cart.findOne({userId : userId})
    
       let TotalItems = items.length
       let TotalPrice = findpro.price * items[0].quantity
  
       if(!findcart){
       
        let cartData = { 
            items: items, 
            totalPrice: TotalPrice, 
            totalItems: TotalItems, 
            userId: userId 
        }
        
        let createCart = await cart.create(cartData)
        return res.status(201).send({ status: true, message: "success", data: createCart })
       }
       else{
       
        const Amount = findcart.totalPrice + (findpro.price * items[0].quantity)
        
        for (let i = 0; i < findcart.items.length; i++) {
            if (findcart.items[i].productId == items[0].productId) {
                findcart.items[i].quantity = findcart.items[i].quantity + items[0].quantity
                const changecart = await cart.findOneAndUpdate({ userId: userId }, { items: findcart.items, totalPrice:Amount }, { new: true })
                return res.status(201).send({ status: true, message: `product added In Your Cart Successfully`, data:changecart })
            }
        }
        const totalItem = items.length + findcart.totalItems

        const cartData = await cart.findOneAndUpdate({ userId: userId }, { $addToSet: { items: { $each: items } }, totalPrice:Amount, totalItems: totalItem }, { new: true })
        return res.status(201).send({ status: true, message: `product added in Your Cart Successfully`, data: cartData })
       }
    }
    catch (error) {
        console.log(error)

        return res.status(500).send({ status: false, message: error.message })
    }
}

/**************************************Update Cart Api****************************************************/

const updateCart = async function (req, res) {
    try {

        const userId = req.params.userId
        let data = req.body
        let tokenId = req.userId

        let { cartId, productId, removeProduct } = data
        
        // user validation
        if(!isValid(userId)){
            return res.status(400).send({status : false, message : "user Id is missing in length"})
        }

        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "user id is not valid" })
        }
        const validUser = await user.findById(userId);
        if (!validUser) {
            return res.status(404).send({ status: false, message: "User not present" })
        }
         //Authorisation
        if (tokenId !== userId) {
            return res.status(403).send({ status: false, message: "Unauthorized user" })
        }

        // checking data in request body

        if (!isValidRequestBody(data)) {
            return res.status(400).send({ status: false, message: "Please enter details to update the document" })

        }
        // cart validation
        
        if(!cartId){
            return res.status(400).send({status : false, message : "cart id is a required field"})
        }

        if (!isValid(cartId)) {
            return res.status(400).send({ status: false, message: "cart id is missing in length" })
        }

        if (!mongoose.isValidObjectId(cartId)) {
            return res.status(400).send({ status: false, message: "cart id is not valid" })
        }

        const validCart = await cart.findOne({ _id: cartId, userId: userId });
        if (!validCart) {
            return res.status(404).send({ status: false, message: "Cart with this parameters not present" })
        }
        // product validation

        if(!productId){
            return res.status(400).send({status : false, message : "Product id is required to this action"})
        }

        if (!isValid(productId)) {
            return res.status(400).send({ status: false, message: "product id is missing in length" })
        }

        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "product id is not valid" })
        }
    
        const validProduct = await product.findOne({ _id: productId, isDeleted: false });
        if (!validProduct) {
            return res.status(404).send({ status: false, message: "Product not present" })
        }

        let items = validCart.items
        
        let productArr = items.filter(x => x.productId.toString() == productId)
        
        if (productArr.length == 0) {
            return res.status(404).send({ status: false, message: "Product is not present in cart" })
        }

        let index = items.indexOf(productArr[0])

        // if(!removeProduct){
        //     return res.status(400).send({ status: false, message: "remove Product is a required field" })
        // }

        if (!isValid(removeProduct)) {
            return res.status(400).send({ status: false, message: "Please enter removeProduct is missing in length" })
        }

        if (!([0, 1].includes(removeProduct))) {
            return res.status(400).send({ status: false, message: "RemoveProduct field can have only 0 or 1 value" })
        }


        if (removeProduct == 0) {
            
            validCart.totalPrice = (validCart.totalPrice - (validProduct.price * validCart.items[index].quantity)).toFixed(2)
            validCart.items.splice(index, 1)

            validCart.totalItems = validCart.items.length
            validCart.save()

        }

        if (removeProduct == 1) {
          
            validCart.items[index].quantity -= 1
            validCart.totalPrice = (validCart.totalPrice - validProduct.price).toFixed(2)
            
            if (validCart.items[index].quantity == 0) {
                validCart.items.splice(index,1)

            }
            validCart.totalItems = validCart.items.length

            validCart.save()

        }
        
        return res.status(200).send({ status: true, data: validCart })

    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })

    }
}

/**************************************Get Cart Api****************************************************/

const getCart = async function (req, res) {
    try {
        const userId = req.params.userId;
        let tokenId = req.userId
        
        // validation starts
        if(!isValid(userId)){
            return res.status(400).send({ status: false, message: "user id missing in length" })
        }
        
        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "Invalid userId in params." })
        }

         // Authentication & authorization
         if (userId != tokenId) {
            res.status(401).send({ status: false, message: "Unauthorized access! User's info doesn't match" });
            return
        }
        
        //validation end
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

/**************************************Delete Cart Api****************************************************/

const deleteCart = async function (req, res){

    try {
        const userId= req.params.userId

        let tokenId= req.userId

        if(!isValid(userId)){
            return res.status(400).send({ status: false, message: "userId is missing in length" })
        }

        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "Please provide valid User Id" })
        }

        if (userId != tokenId) {
            res.status(401).send({ status: false, message: "Unauthorized access! User's info doesn't match" });
            return
         }

        const findUser = await user.findById(userId)

        if (!findUser){
            return res.status(404).send({status: false,message:"User does not exist"})
        }

        const deletedCart = await cart.findOneAndUpdate({userId:userId},{$set:{items:[], totalItems:0, totalprice:0}},{new:true})
        
        if(deletedCart){
            return res.status(200).send({status:true, message: "All items in cart deleted Successfully",data:deletedCart})
        }
        else{
            return res.status(404).send({status: false,message:"cart for this user does not yet exists"})
        }

        } 
        catch (error) {
            return res.status(500).send({ status: false, message: error.message })
        }
    }



module.exports = { createCart, getCart ,updateCart, deleteCart }