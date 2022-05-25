const product = require('../model/productModel')
const {isValidRequestBody, isValid} = require("../validations/validations")
const {uploadFile} = require("../middleware/aws")
const { default: mongoose } = require('mongoose')


const createProduct = async (req,res)=>{
    try{
        let data = req.body
        let {title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSize, installment}= data

        if(! isValidRequestBody(data)){
            return res.status(400).send({status : false, message : "Please provide some input"})
        }

        if(!title){
            return res.status(400).send({status : false, message : "Title is a required field"})
        }else{
            if(!isValid(title)){
                return res.status(400).send({status : false, message : "This is not a valid title"})
            }

            let dupTitle = await product.findOne({title : title})

            if(dupTitle){
                return res.status(409).send({status : false, message : "This title is already being used"})
            }
        }

        if(!description){
            return res.status(400).send({status : false, message : "description is a required field"})
        }else{

           
            if(!isValid(description)){
                return res.status(400).send({status : false, message : "This is not a valid description"})
            }
        }

        if(!price){
            return res.status(400).send({status : false, message : "Price must be present"})
        }else{
            // if(typeof price !== 'number'){
            //     return res.status(400).send({status : false, message : "Price must be in Numbers"})
            // }
            if(!isValid(price)){
                return res.status(400).send({status : false, message : "This is not a valid Price"})
            }
        }

        if(currencyId){
            if(currencyId !== "INR"){
                return res.status(400).send({status : false, message : "Currency ID Must be in INR"})
            }
        } else{
            data.currencyId = "INR"
        }

        if(currencyFormat){
            if(currencyId !== "₹"){
                return res.status(400).send({status : false, message : "currency format must be ₹ "})
            }
        } else{
            data.currencyFormat = "₹"
        }

        if(isFreeShipping){
            if(typeof isFreeShipping !== 'boolean'){
                return res.status(400).send({status : false, message : "is Free Shipping must be a BOOLEAN VALUE"})
            }
        }

        if(style){
            if(!isValid(style)){
                return res.status(400).send({status : false, message : "please enter the style"})
            }
        }

        if(!availableSize){
            return res.status(400).send({status : false, message : "Available sizes must be provided"})
        }
        else{
            if(!isValid(availableSize)){
                return res.status(400).send({status : false, message : "please provide valid input"})
            }
            let sizeArray = ["S", "XS","M","X", "L","XXL", "XL"]

            if(!sizeArray.includes(availableSize)){
                return res.status(400).send({status : false, message : `Available sizes must be in ${sizeArray}` })
            }
        }

        if(installment){
            if(!isValid(installment)){
                return res.status(400).send({status : false, message : "Please provide valid installment"})
            }

            if(typeof installment !== 'number'){
                return res.status(400).send({status : false, message : "only number values are acceptable in Installments"})
            }
        }

        let files = req.files

        if(!files || files.length== 0){
            return res.status(400).send({status : false, message : "no files found"})
        }

        if(files && files.length>0){
            let uploadedFileURL = await uploadFile(files[0]);
            data["productImage"] = uploadedFileURL;
        }

        let createProduct = await product.create(data)
        if(createProduct){
            return res.status(201).send({status : true, message : "Product successfully created", data : createProduct})
        }
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })      
    }
}


const getProductbyQuery = async (req,res)=>{
    try{
        

    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })      
    }
}


const getProductByID = async (req,res)=>{
    try{
        let productID = req.params.productId
        let data =req.params

        if(!isValidRequestBody(data)){
            return res.status(400).send({status : false, message : "Please Provide some Input"})
        }

        if(!productID){
            return res.status(400).send({status : false, message : "product Id must be present to do this action"})
        }
        
        let verifyId = mongoose.isValidObjectId(productID)
        if(!verifyId){
            return res.status(400).send({status : false, message : "This is not a valid product ID"})
        }

        let findProduct = await product.findOne({_id : productID})

        if(!findProduct){
            return res.status(404).send({status : false, message : "No product with this id exists"})
        }else{
            return res.status(200).send({status : true, message : "success", data : findProduct})
        }

    }catch (error) {
        return res.status(500).send({ status: false, message: error.message })      
    }
}



module.exports = {createProduct, getProductByID}