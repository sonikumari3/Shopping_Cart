const product = require('../model/productModel')
const {isValidRequestBody, isValid, isValidName, isValidPrice} = require("../validations/validations")
const {uploadFile} = require("../middleware/aws")
const { default: mongoose } = require('mongoose')


const createProduct = async (req,res)=>{
    try{
        let data = JSON.parse(JSON.stringify(req.body))
        let {title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments}= data

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
            if(!isValid(currencyId)){
                return res.status(400).send({status : false, message : "currency id is missing"})
            }
            if(currencyId !== "INR"){
                return res.status(400).send({status : false, message : "Currency ID Must be in INR"})
            }
        } else{
            data.currencyId = "INR"
        }

        if(currencyFormat){ 
            if(!isValid(currencyFormat)){
                return res.status(400).send({status : false, message : "currency format is missing"})
            }

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
            
            if (["true", "false"].includes(isFreeShipping) === false) {
                return res.status(400).send({ status: false, message: "isFreeShipping should be boolean" });
            }
        }

        if(style){
            if(!isValid(style)){
                return res.status(400).send({status : false, message : "please enter the style"})
            }
            if(!isValidName(style)){
                return res.status(400).send({status : false, message : 'Style only takes alphabets'})
            }
        }

        if(!availableSizes){
            return res.status(400).send({status : false, message : "Available sizes must be provided"})
        }
        else{
            if(!isValid(availableSizes)){
                return res.status(400).send({status : false, message : "please provide valid input"})
            }

            let sizes = availableSizes.toUpperCase().split(",")
            let arr = ["S", "XS","M","X", "L","XXL", "XL"]

            if(sizes.some(x => !arr.includes(x.trim())))
               return res.status(400).send({status : false, message : `available sizes must be in ${arr}`})

            data['availableSizes'] = sizes
            
        }

        if(installments){
            if(!isValid(installments)){
                return res.status(400).send({status : false, message : "Please provide valid installment"})
            }

            if(isNaN(installments)){
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


const getProductsByQuery = async (req,res)=>{
    try{
        let data = req.query 
        let filter = {
            isDeleted : false
        }

        let {name, size, priceSort, priceGreaterThan, priceLessThan} = data

        if(name){
            if(!isValid(name)){
                return res.status(400).send({status : false, message : "the name is missing in length"})
            }
            
            if(!isValidName(name)){
                return res.status(400).send({stauts : false, message : "name must be in alphabets only"})
            }

            filter['title'] = { $regex: name, $options:"i" }
        }

        if(size){
            if(!isValid(size)){
                return res.status(400).send({status : false, message : "the size is missing in lenght"})
            }
    
            filter['availableSizes'] = size
        }
        
        if(priceGreaterThan){
            if(!isValid(priceGreaterThan)){
                return res.status(400).send({status : false, messsage : "Price greater than must have some length"})
            }

            if(isNaN(priceGreaterThan)){
                return res.status(400).send({status : false, message : "price greater than must be number"})
            }

            filter['price'] = {
                '$gt' : priceGreaterThan
            }
        }

        if(priceLessThan){
            if(!isValid(priceLessThan)){
                return res.status(400).send({status : false, messsage : "priceLessThan must have some length"})
            }

            if(isNaN(priceLessThan)){
                return res.status(400).send({status : false, message : "priceLessThan must be number"})
            }

            filter['price'] = {
                '$lt' : priceLessThan
            }
        }

        if(priceLessThan && priceGreaterThan){
            filter['price'] = { '$lte' : priceLessThan, '$gte' : priceGreaterThan}
        }

        if(priceSort){
            if(priceSort != 1 || priceSort != -1){
                return res.status(400).send({status : false, message : "Price sort only takes 1 or -1 as a value" })
            }

            let filterProduct = await product.find(filter).sort({price: priceSort})

            if(filterProduct.length>0){
                return res.status(200).send({status : false, message : "Success", data : filterProduct})
            }
            else{
                return res.status(404).send({status : false, message : "No products found with this query"})
            }
        } 
        else{
            let findProduct = await product.find(filter)

            if(findProduct.length>0){
                return res.status(200).send({status : false, message : "Success", data : findProduct})
            }
            else{
                return res.status(404).send({status : false, message : "No products found with this query"})
            }
        }

    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })      
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

        let data = JSON.parse(JSON.stringify(req.body))

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

        let {title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments} = data
        
        if(title == ""){
            return res.status(400).send({status : false, message: 'Title does not take an empty string'})
        }
        else if(title){
    
            if(!isValid(title)){
                return res.status(400).send({status : false, message : "title is missing in lenght"})
            }

            if(!isValidName(title)){
                return res.status(400).send({status : false, message : "Title must contain only alphabets"})
            }

            let dupTitle = await product.findOne({title : title})

            if(dupTitle){
                return res.status(409).send({status : false, message : "This title is already being used"})
            }
        }
    
            
        if(description == ""){
            return res.status(400).send({status : false, message: 'description does not take an empty string'})
        }
         else if(description){ 
            
            if(!isValid(description)){
                return res.status(400).send({status : false, message : "This is not a valid description"})
            }
        }
            
        
        if(price == ""){
            return res.status(400).send({status : false, message: 'price does not take an empty string'})
        }
        else if(price){
            if(!isValid(price)){
                return res.status(400).send({status : false, message : "price is missing"})
            }

            if(!isValidPrice(price)){
                return res.status(400).send({status : false, message : "please enter a valid price"})
            }
        }
            
        if(currencyId == ""){
            return res.status(400).send({status : false, message: 'currencyId does not take an empty string'})
        }
        else if(currencyId){
           
            if(!isValid(currencyId)){
                return res.status(400).send({status : false, message : "please enter a currency id"})
            }

            if(currencyId !== "INR"){
                return res.status(400).send({status : false, message : "Only INR is accepted as Currency INR"})
            }
        }           
        
        if(currencyFormat == ""){
            return res.status(400).send({status : false, message: 'currencyFormat does not take an empty string'})
        }
        else if(currencyFormat){

            if(!isValid(currencyFormat)){
                return res.status(400).send({status : false, message : "please enter a currency format"})
            }

            if(currencyId !== "₹"){
                return res.status(400).send({status : false, message : "currency format must be ₹ "})
            }
        }
        
        if(isFreeShipping == ""){
            return res.status(400).send({status : false, message: 'isFreeShipping does not take an empty string'})
        }
        else if(isFreeShipping){
        
            if(!isValid(isFreeShipping)){
                return res.status(400).send({status : false, message : "isFreeShipping is missing"})
            }
            
            if (["true", "false"].includes(isFreeShipping) === false) {
                return res.status(400).send({ status: false, message: "isFreeShipping should be boolean" });
            }    
        }

        
        if(style == ""){
            return res.status(400).send({status : false, message: 'style does not take an empty string'})
        }
        else if(style){
            
            if(!isValid(style)){
                return res.status(400).send({status : false, message : "please enter the style"})
            }
            if(!isValidName(style)){
                return res.status(400).send({status : false, message : 'Style only takes alphabets'})
            }
        }

        if(availableSizes == ""){
            return res.status(400).send({status : false, message: 'availableSizes does not take an empty string'})
        }
        else if(availableSizes){
        
            if(!isValid(availableSizes)){
                return res.status(400).send({status : false, message : "please provide valid input"})
            }

            let sizes = availableSizes.toUpperCase().split(",")
            let arr = ["S", "XS","M","X", "L","XXL", "XL"]

            if(sizes.some(x => !arr.includes(x.trim())))
               return res.status(400).send({status : false, message : `available sizes must be in ${arr}`})
            
            data.availableSizes = sizes
        }

       
        if(installments == ""){
            return res.status(400).send({status : false, message: 'installments does not take an empty string'})
        }
        else if(installments){
          
            if(!isValid(installments)){
                return res.status(400).send({status : false, message : "Please provide valid installment"})
            }

            if(isNaN(installments)){
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




module.exports = {createProduct, getProductByID, updateProduct, deleteProduct, getProductsByQuery}