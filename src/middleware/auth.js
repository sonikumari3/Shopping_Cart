
const jwt = require('jsonwebtoken')
let secretKey = 'vjfjdaehvkxfpekfpekfojdsopfjsdaoifji'

const authentication = function(req,res,next){
    try{
       let token = req.headers['x-api-key']

       if(!token){
           return res.status(400).send({status : false, message : "You are not logged in, please logIn"})
       }

       let decodeToken = jwt.verify(token, secretKey)

       if(!decodeToken){
           return res.status(400).send({status : false, message : "Token validation failed"})
       }

       let exp = decodeToken.exp
        let timeNow = Math.floor(Date.now() / 1000)
        /// expiration case handle
        if(exp < timeNow) return res.status(401).send({status:false,msg:'Token is expired now'})
        // putting userId in the headers
        req.userId = decodeToken.userId 

       next()
    }
    catch(error) {
        return res.status(500).send({ status: false, message: error.message })      
    }
}

module.exports = {authentication}