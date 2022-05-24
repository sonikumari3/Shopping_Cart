const user = require('../model/userModel')
const aws = require('aws-sdk')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')



const isValidRequestBody = function (value) {
    return Object.keys(value).length > 0
  }
  
  //validaton check for the type of Value --
  const isValid = (value) => {
    if (typeof value == 'undefined' || value == null) return false;
    if (typeof value == 'string' && value.trim().length == 0) return false;
    if (typeof value === 'number'&&value.toString().trim().length===0) return false;
    return true
  }
  
 
  
  
  aws.config.update({
    accessKeyId: "AKIAY3L35MCRUJ6WPO6J",
    secretAccessKey: "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",
    region: "ap-south-1"
  })
  
  let uploadFile = async (file) => {
    return new Promise(function (resolve, reject) {
      
      let s3 = new aws.S3({ apiVersion: '2006-03-01' }); 
  
      var uploadParams = {
        ACL: "public-read",
        Bucket: "classroom-training-bucket",  
        Key: "abc/" + file.originalname, 
        Body: file.buffer
      }
  
  
      s3.upload(uploadParams, function (err, data) {
        if (err) {
          return reject({ "error": err })
        }
        console.log(data)
        console.log("file uploaded succesfully")
        return resolve(data.Location)
      })
   })
  }

const createUser =async (req,res)=>{

    try {
        let data = req.body

        if (!isValidRequestBody(data)) {
            res.status(400).send({ status: false, message: "invalid request parameters.plzz provide user details" })
            return
        }

        //Validate attributes --
        let { fname, lname, email, password, phone, address } = data

        if (!isValid(fname)) {
            res.status(400).send({ status: false, message: " first name is required" })
            return
        }
        if (!/^[A-Za-z\s]{1,}[\.]{0,1}[A-Za-z\s]{0,}$/.test(fname)) {
            return res.status(400).send({ status: false, message: "Please enter valid user first name." })
        }
       

        // name validation
        if (!isValid(lname)) {
            res.status(400).send({ status: false, message: "last name is required" })
            return
        }

        //this will validate the type of name including alphabets and its property withe the help of regex.
        if (!/^[A-Za-z\s]{1,}[\.]{0,1}[A-Za-z\s]{0,}$/.test(lname)) {
            return res.status(400).send({ status: false, message: "Please enter valid user last name." })
        }

        //Email Validation --
        if (!isValid(email)) {
            return res.status(400).send({ status: false, message: "plzz enter email" })
        }
        const emailPattern = /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})/       //email regex validation for validate the type of email.

        if (!email.match(emailPattern)) {
            return res.status(400).send({ status: false, message: "This is not a valid email" })
        }

        email = email.toLowerCase().trim()
        const emailExt = await user.findOne({ email: email })
        if (emailExt) {
            return res.status(409).send({ status: false, message: "Email already exists" })
        }

        //Password Validations--
        if (!isValid(password)) {
            return res.status(400).send({ status: false, message: "plzz enter password" })
        }
        if (password.length < 8 || password.length > 15) {
            return res.status(400).send({ status: false, message: "plzz enter valid password" })
        }

        const salt=await bcrypt.genSalt(10)
        data.password = await bcrypt.hash(data.password,salt)


        //Phone Validations--
        if (!isValid(phone)) {
            return res.status(400).send({ status: false, message: "plzz enter mobile" })
        }

        //this regex will to set the phone no. length to 10 numeric digits only.
        if (!/^(\+91)?0?[6-9]\d{9}$/.test(phone)) {
            return res.status(400).send({ status: false, message: "Please enter valid 10 digit mobile number." })
        }

        const phoneExt = await user.findOne({ phone: phone })
        if (phoneExt) {
            return res.status(409).send({ status: false, message: "phone number already exists" })
        }

        //for address--
        
        if(!isValid(address)){
            return res.status(400).send({ status: false, message: "address is invalid" })
        }

        // this validation will check the address is in the object format or not--
        if(!address){
            return res.status(400).send({ status: false, message: "address is required" })
        }
           address=JSON.parse(address)

            if (typeof address != "object") {
                return res.status(400).send({ status: false, message: "address should be an object" })
            }
            let { shipping,billing} = address
            console.log(shipping)

            if(!shipping){
                return res.status(400).send({ status: false, message: "shipping is required" })
            }
    
                if (typeof shipping != "object") {
                    return res.status(400).send({ status: false, message: "shipping should be an object" })
                }
            if(!billing){
                return res.status(400).send({ status: false, message: "billing is required" })
            }
    
                if (typeof billing != "object") {
                    return res.status(400).send({ status: false, message: "billing should be an object" })
                }
            
                if (!isValid(shipping.street)) {
                    return res.status(400).send({ status: false, message: "shipping street is required" })
                }


                if (!isValid(shipping.city)) {
                    return res.status(400).send({ status: false, message: "shipping city is required" })
                }
                if (!/^[a-zA-Z]+$/.test(shipping.city)) {
                    return res.status(400).send({ status: false, message: "city field have to fill by alpha characters" });
                }
    

                if (!isValid(shipping.pincode)) {
                    return res.status(400).send({ status: false, message: "shipping street is required" })
                }

                 //applicable only for numeric values and extend to be 6 characters only--
                if (!/^\d{6}$/.test(shipping.pincode)) {
                    return res.status(400).send({ status: false, message: "plz enter valid pincode" });
                }

                if (!isValid(billing.street)) {
                    return res.status(400).send({ status: false, message: "billing street is required" })
                }


                if (!isValid(billing.city)) {
                    return res.status(400).send({ status: false, message: "billing city is required" })
                }
                if (!/^[a-zA-Z]+$/.test(billing.city)) {
                    return res.status(400).send({ status: false, message: "city field have to fill by alpha characters" });
                }
    

                if (!isValid(billing.pincode)) {
                    return res.status(400).send({ status: false, message: "billing street is required" })
                }

                 //applicable only for numeric values and extend to be 6 characters only--
                if (!/^\d{6}$/.test(billing.pincode)) {
                    return res.status(400).send({ status: false, message: "plz enter valid  billing pincode" });
                }
                data.address=JSON.parse(data.address)

        let file= req.files
        console.log(file)
        if(file && file.length>0){
                   
        let uploadedFileURL= await uploadFile( file[0] )
                   
        data["profileImage"]=uploadedFileURL
        }
        else{
            return res.status(400).send({ msg: "No file found" })
        }

        let saveData = await user.create(data)
        return res.status(201).send({ status: true, message: "success", data: saveData })
        
    }
     catch (error) {

        return res.status(500).send({ status: "error", message: error.message })
        
    }
}


const logIn = async(req,res)=>{
    try{
      let data = req.body
      let {email, password} = data

      if(!email || email.length == 0){
          return res.status(400).send({status : false, message : "Email must be provide"})
      }

      if(email){
          let emailPattern = /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})/g 
          if(!email.match(emailPattern)){
              return res.status(400).send({status : false, message : 'please provide a valid email'})
          }
      }
      
      if(!password || password.length == 0){
        return res.status(400).send({status : false, message : "password must be provide"})
      }

      if (password.trim().length < 8 || password.trim().length > 15) {
        return res.status(400).send({ status: false, message: "plzz enter valid password" })
     }

     let emailExt = await user.findOne({email : email})

     if(!emailExt){
        return res.status(404).send({ status: false, message: "an account with this email does not exists" })
     }

     let comparePassword = await bcrypt.compare(password, emailExt.password)

     if(!comparePassword){
       return res.status(400).send({status : false, message : "Please provide a valid password"})
     }else{
         let params = {
             userId : emailExt._id,
             iat : Date.now()
         }

         let secretKey = 'vjfjdaehvkxfpekfpekfojdsopfjsdaoifji'

        let token = jwt.sign(params, secretKey)

        res.header('x-api-key', token)

        return res.status(200).send({status : true, message : "User logIn Successfull", data : {userId : emailExt._id, token : token }})
     }

    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })      
    }
}


const findProfile = async (req,res)=>{
    try{
       let userId = req.params

       if(!userId){
           return res.status(400).send({status : false, message : "User ID is required to do this action"})
       }

       if(!mongoose.isValidObjectId(userId)){
          return res.status(400).send({status : false, message : "User ID is required to do this action"})
       }
       
       let findUser = await user.findOne({_id : userId})

       if(!findUser){
        return res.status(404).send({status : false, message : "no user with this id exists"})
       }else{
           return res.status(200).send({status : false, message : "success", data : findUser})
       }

    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })      
    }
}

const updateProfile = async (req,res)=>{
    try{
       let data = req.body
       let id = req.params

       if(!id){
           return res.status(400).send({status : false, message : "User id is required to do this action"})
       }

       let findUser = await user.findOne({_id : id})
       
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })      
    }
}


module.exports = {createUser, logIn, findProfile }