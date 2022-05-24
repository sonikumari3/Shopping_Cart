const { LexModelBuildingService } = require('aws-sdk')
const jwt = require('jsonwebtoken')
let secretKey = 'vjfjdaehvkxfpekfpekfojdsopfjsdaoifji'

const authentication = function(req,res,next){
    try{
       let token = req.header['x-api-key']

       if(!token){
           return res.status(400).send({status : false, message : "You are not logged in, please logIn"})
       }

       let decodeToken = jwt.verify(token, secretKey)

       if(!decodeToken){
           return res.status(400).send({status : false, message : "Token validation failed"})
       }

       next()
    }
    catch(error) {
        return res.status(500).send({ status: "error", message: error.message })      
    }
}

module.exports = {authentication}