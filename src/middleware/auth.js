const jwt = require('jsonwebtoken')
let secretKey = 'vjfjdaehvkxfpekfpekfojdsopfjsdaoifji'

const authentication = function(req,res,next){
    try{
        let token = req.headers["authorization"] 

        if (!token) {
            return res.status(400).send({ Status: false, message: " Please enter the token" })
        }

        let userToken= token.split(" ")

       let decodeToken = jwt.verify(userToken[1], secretKey)

       if(!decodeToken){
           return res.status(400).send({status : false, message : "Token validation failed"})
       }

       let exp = decodeToken.exp
        let timeNow = Math.floor(Date.now() / 1000)
        /// expiration case handle
        if(exp < timeNow) return res.status(401).send({status:false, message:'Token is expired now'})
        // putting userId in the headers
        req.userId = decodeToken.userId 

       next()
    }
    catch(error) {
        return res.status(500).send({ status: false, message: error.message })      
    }
}

module.exports = {authentication}