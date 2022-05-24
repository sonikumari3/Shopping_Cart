const user = require('../model/userModel')


const createUser = async (req,res)=>{
    try{
        let address = req.address

        if(!address || Object.keys(address).length === 0){
            return res.status(400).send({status : false, message: "Address is a required field and can not be empty"})
        }

    }
    catch(err){
        return res.status(500).send({status: false, message : err.message})
    }
}
