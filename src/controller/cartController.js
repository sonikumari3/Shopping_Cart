const { default: mongoose } = require('mongoose')
const cartModel = require('../model/cartModel')
const { isValid, isValidRequestBody } = require('../validations/validations')

const createCart  = async(req,res)=>{
    try{
        let userId = req.params.userId
        let TokenId = req.userId

        if(!userId){
            return res.status(400).send({status : false, message : "User id is required to do this action"})
        }

        if(!isValid(userId)){
            return res.status(400).send({status : false, message : "user id is missing in length"})
        }

        if(mongoose.isValidObjectId(userId)=== false){
            return res.status(400).send({status : false, message :"user Id is not valid"})
        }
        
        if(!TokenId){
            return res.status(400).send({status : false, message : "Token id is missing"})
        }

        if(mongoose.isValidObjectId(TokenId)=== false){
            return res.status(400).send({status : false, message :"Token Id is not valid"})
        }

        if(TokenId !== userId){
            return res.status(401).send({status : false, message :"You are not authorized"})
        }

        let body = req.body

        if(!isValidRequestBody(body)){
            return res.status(400).send({status : false, message : "no input provided in body"})
        }


    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })      
    }
}