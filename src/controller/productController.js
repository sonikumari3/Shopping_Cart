const product = require('../model/productModel')
const {isValidRequestBody, isValid, isValidName, isValidPrice, isBoolean, isNumber} = require("../validations/validations")
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

            if(!isValidName(title)){
                return res.status(400).send({status : false, message : "title can only be of alphabets"})
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
            if(!isValid(price)){
                return res.status(400).send({status : false, message : "price is missing"})
            }

            if(!isValidPrice(price)){
                return res.status(400).send({status : false, message : "please enter a valid price"})
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
            if(!isValid(isFreeShipping)){
                return res.status(400).send({status : false, message : "isFreeShipping is missing"})
            }
            
            if(!isBoolean(isFreeShipping)){
                return res.status(400).send({status : false, message : "only Boolean value is accepted in shipping"})
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

            if(!isNumber(installment)){
                return res.status(400).send({status : false, message : "Isntallment must be a Number"})
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



const getAllProducts = async function(req, res) {
    try {
        const filterQuery = { isDeleted: false } //complete object details.
        const queryParams = req.query;

        if (isValidRequestBody(queryParams)) {
            const { size, name, priceGreaterThan, priceLessThan, priceSort } = queryParams;

            //validation starts.
            if (isValid(size)) {
                filterQuery['availableSizes'] = size
            }

            //using $regex to match the subString of the names of products & "i" for case insensitive.
            if (isValid(name)) {
                filterQuery['title'] = {}
                filterQuery['title']['$regex'] = name
                filterQuery['title']['$options'] = 'i'
            }

            //setting price for ranging the product's price to fetch them.
            if (isValid(priceGreaterThan)) {

                if (!(!isNaN(Number(priceGreaterThan)))) {
                    return res.status(400).send({ status: false, message: `priceGreaterThan should be a valid number` })
                }
                if (priceGreaterThan <= 0) {
                    return res.status(400).send({ status: false, message: `priceGreaterThan should be a valid number` })
                }
                if (!filterQuery.hasOwnProperty('price'))
                    filterQuery['price'] = {}
                filterQuery['price']['$gte'] = Number(priceGreaterThan)
                    //console.log(typeof Number(priceGreaterThan))
            }

            //setting price for ranging the product's price to fetch them.
            if (isValid(priceLessThan)) {

                if (!(!isNaN(Number(priceLessThan)))) {
                    return res.status(400).send({ status: false, message: `priceLessThan should be a valid number` })
                }
                if (priceLessThan <= 0) {
                    return res.status(400).send({ status: false, message: `priceLessThan should be a valid number` })
                }
                if (!filterQuery.hasOwnProperty('price'))
                    filterQuery['price'] = {}
                filterQuery['price']['$lte'] = Number(priceLessThan)
                    //console.log(typeof Number(priceLessThan))
            }

            //sorting the products acc. to prices => 1 for ascending & -1 for descending.
            if (isValid(priceSort)) {

                if (!((priceSort == 1) || (priceSort == -1))) {
                    return res.status(400).send({ status: false, message: `priceSort should be 1 or -1 ` })
                }

                const products = await product.find(filterQuery).sort({ price: priceSort })
                    // console.log(products)
                if (Array.isArray(products) && products.length === 0) {
                    return res.status(404).send({ productStatus: false, message: 'No Product found' })
                }

                return res.status(200).send({ status: true, message: 'Product list', data2: products })
            }
        }

        const products = await product.find(filterQuery)

        //verifying is it an array and having some data in that array.
        if (Array.isArray(products) && products.length === 0) {
            return res.status(404).send({ productStatus: false, message: 'No Product found' })
        }

        return res.status(200).send({ status: true, message: 'Product list', data: products })
    } catch (error) {
        return res.status(500).send({ status: false, error: error.message });
    }
}


const getProductByID = async (req,res)=>{
    try{
        let productID = req.params.productId

        if(!productID || productID.trim().length === 0){
            return res.status(400).send({status : false, message : "product Id must be present to do this action"})
        }
        
        let verifyId = mongoose.isValidObjectId(productID)
        if(!verifyId){
            return res.status(400).send({status : false, message : "This is not a valid product ID"})
        }

        let findProduct = await product.findOne({_id : productID})

        if(!findProduct){
            return res.status(404).send({status : false, message : "No product with this id exists"})
        }
        
        if(findProduct.isDeleted){
            return res.status(404).send({status : false, message : "This product does not exists anymore"})
        }
        else{
            return res.status(200).send({status : true, message : "success", data : findProduct})
        }

    }catch (error) {
        return res.status(500).send({ status: false, message: error.message })      
    }
}


const updateProduct  = async (req, res)=>{
    try{

        let data = req.body

        if(!isValidRequestBody(data)){
            return res.status(400).send({status : false, message : "No input has been provided"})
        }

        let ProductId = req.params.productId

        if(!ProductId){
            return res.status(400).send({status : false, message :"Product id is required to this action"})
        }

        if(!isValid(ProductId)){
            return res.status(400).send({status : false, message : "Product id is missing"})
        }

        if(!mongoose.isValidObjectId(ProductId)){
            return res.status(400).send({status : false, message : "Please Provide a valid Product Id"})
        }

        let findProduct = await product.findOne({_id : ProductId})

        if(!findProduct){
            return res.status(404).send({status : false, message : 'No product with this id exists'})
        }

        if(findProduct.isDeleted){
            return res.status(404).send({status :false, message : 'This product is deleted'})
        }

        let {title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSize, installment} = data

        if(title){
        
            if(!isValid(title)){
                return res.status(400).send({status : false, message : "This is not a valid title"})
            }

            let dupTitle = await product.findOne({title : title})

            if(dupTitle){
                return res.status(409).send({status : false, message : "This title is already being used"})
            }
        }

        if(description){ 
            if(!isValid(description)){
                return res.status(400).send({status : false, message : "This is not a valid description"})
            }
        }

        if(price){
            if(!isValid(price)){
                return res.status(400).send({status : false, message : "price is missing"})
            }

            if(!isValidPrice(price)){
                return res.status(400).send({status : false, message : "please enter a valid price"})
            }
        }

        if(currencyId){
            if(!isValid(currencyId)){
                return res.status(400).send({status : false, message : "please enter a currency id"})
            }

            if(currencyId !== "INR"){
                return res.status(400).send({status : false, message : "Only INR is accepted as Currency INR"})
            }
        }

        if(currencyFormat){
            if(!isValid(currencyFormat)){
                return res.status(400).send({status : false, message : "please enter a currency format"})
            }

            if(currencyId !== "₹"){
                return res.status(400).send({status : false, message : "currency format must be ₹ "})
            }
        }

        if(availableSize){
        
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

            if(!isNumber(installment)){
                return res.status(400).send({status : false, message : "Isntallment must be a Number"})
            }
        }

        let files = req.files

        if(files && files.length>0){
            let uploadedFileURL = await uploadFile(files[0]);
            data["productImage"] = uploadedFileURL;
        }

        let updateProduct= await product.findOneAndUpdate({_id :ProductId}, {$set : {...data}, updatedAt: Date.now()}, {new : true, upsert : true})
        
        return res.status(200).send({status : true,  message : "Updated Successfully", data : updateProduct})

    }catch (error) {
        return res.status(500).send({ status: false, message: error.message })      
    }
}

const deleteProduct = async (req, res)=>{
    try{
        let id = req.params.productId

        if(!id){
            return res.status(400).send({status : false, message : "product Id must be provided in order to delete it"})
        }

        if(!isValid(id)){
            return res.status(400).send({status : false, message : "product id is missing"})
        }

        if(!mongoose.isValidObjectId(id)){
            return res.status(400).send({status : false, message : "please provide a valid user id"})
        }

        let findProduct = await product.findById({_id : id})

        if(!findProduct){
            return res.status(404).send({status : false, message : "No product with this id exists"})
        }

        if(findProduct.isDeleted){
            return res.status(404).send({status :false, message : 'This product is deleted'})
        }

        let deleteProduct = await product.findOneAndUpdate({_id : id}, {$set : {isDeleted : true}, deletedAt : Date.now()}, {new : true, upsert: true})

        return res.status(200).send({status : true, message : "Product deleted successfully", data : deleteProduct})

    }catch (error) {
        return res.status(500).send({ status: false, message: error.message })      
    }
}




module.exports = {createProduct,getAllProducts, getProductByID, updateProduct, deleteProduct}