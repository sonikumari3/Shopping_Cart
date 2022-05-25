const product = require('../model/productModel')


const createProduct = async (req,res)=>{
    try{

    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })      
    }
}