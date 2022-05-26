const user = require("../model/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { uploadFile } = require("../middleware/aws");
const { isValidRequestBody, isValid, isValidName, isValidEmail, isValidPhone, isValidCity, isValidPincode, isValidFile } = require("../validations/validations");

const createUser = async (req, res) => {
    try {
        let data = req.body;

        if (!isValidRequestBody(data)) {
            return res.status(400).send({ status: false, message: "invalid request parameters.plzz provide user details" });
        }

        //Validate attributes --
        let { fname, lname, email, password, phone, address } = data;

        if (!fname) {
            return res.status(400).send({ status: false, message: " first name is a required field" });
        }

        if (!isValid(fname)) {
            return res.status(400).send({ status: false, message: " first name is required" });
        }
        if (!isValidName(fname)) {
            return res.status(400).send({status: false, message: "Please enter valid user first name."});
        }

        // name validation
        if (!lname) {
            return res.status(400).send({ status: false, message: "last name is a required field" });
        }

        if (!isValid(lname)) {
            return res.status(400).send({ status: false, message: "last name is required" });
        }

        //this will validate the type of name including alphabets and its property withe the help of regex.
        if (!isValidName(lname)) {
            return res.status(400).send({ status: false, message: "Please enter valid user last name." });
        }

        //Email Validation --
        if (!email) {
            return res.status(400).send({ status: false, message: "email is a required field" });
        }

        if (!isValid(email)) {
            return res.status(400).send({ status: false, message: "plzz enter email" });
        }

        if (!isValidEmail(email)) {
            return res.status(400).send({ status: false, message: "This is not a valid email" });
        }

        email = email.toLowerCase().trim();
        const emailExt = await user.findOne({ email: email });
        if (emailExt) {
            return res.status(409).send({ status: false, message: "Email already exists" });
        }

        //Password Validations--
        if (!password) {
            return res.status(400).send({ status: false, message: "password is a required field" });
        }

        if (!isValid(password)) {
            return res.status(400).send({ status: false, message: "plzz enter password" });
        }
        if (password.length < 8 || password.length > 15) {
            return res.status(400).send({ status: false, message: "plzz enter valid password" });
        }

        const salt = await bcrypt.genSalt(10);
        data.password = await bcrypt.hash(data.password, salt);

        //Phone Validations--
        if (!phone) {
            return res.status(400).send({ status: false, message: "Phone is a required field" });
        }

        if (!isValid(phone)) {
            return res.status(400).send({ status: false, message: "plzz enter mobile" });
        }

        //this regex will to set the phone no. length to 10 numeric digits only.
        if (!isValidPhone(phone)) {
            return res.status(400).send({status: false,message: "Please enter valid 10 digit mobile number."});
        }

        const phoneExt = await user.findOne({ phone: phone });
        if (phoneExt) {
            return res.status(409).send({ status: false, message: "phone number already exists" });
        }

        //for address--

        if (!isValid(address)) {
            return res.status(400).send({ status: false, message: "address is invalid" });
        }

        // this validation will check the address is in the object format or not--
        if (!address) {
            return res.status(400).send({ status: false, message: "address is required" });
        }
        
        address = JSON.parse(address);

        if (typeof address != "object") {
            return res.status(400).send({ status: false, message: "address should be an object" });
        }
        let { shipping, billing } = address;
        console.log(shipping);

        if (!shipping) {
            return res.status(400).send({ status: false, message: "shipping address is required" });
        }

        if (typeof shipping != "object") {
            return res.status(400).send({ status: false, message: "shipping should be an object" });
        }

        if (!isValid(shipping.street)) {
            return res.status(400).send({ status: false, message: "shipping street is required" });
        }

        if (!isValid(shipping.city)) {
            return res.status(400).send({ status: false, message: "shipping city is required" });
        }

        if (!isValidCity(shipping.city)) {
            return res.status(400).send({status: false, message: "city field have to fill by alpha characters"});
        }

        if (!isValid(shipping.pincode)) {
            return res.status(400).send({ status: false, message: "shipping street is required" });
        }

        //applicable only for numeric values and extend to be 6 characters only--
        if (!isValidPincode(shipping.pincode)) {
            return res.status(400).send({ status: false, message: "plz enter valid pincode" });
        }

        if (!billing) {
            return res.status(400).send({ status: false, message: "billing address is required" });
        }

        if (typeof billing != "object") {
            return res.status(400).send({ status: false, message: "billing should be an object" });
        }

        if (!isValid(billing.street)) {
            return res.status(400).send({ status: false, message: "billing street is required" });
        }

        if (!isValid(billing.city)) {
            return res.status(400).send({ status: false, message: "billing city is required" });
        }
        if (!isValidCity(billing.city)) {
            return res.status(400).send({status: false,message: "city field have to fill by alpha characters"});
        }

        if (!isValid(billing.pincode)) {
            return res.status(400).send({ status: false, message: "billing street is required" });
        }

        //applicable only for numeric values and extend to be 6 characters only--
        if (!isValidPincode(billing.pincode)) {
            return res.status(400).send({ status: false, message: "plz enter valid  billing pincode" });
        }
        data.address = JSON.parse(data.address);

        let file = req.files;
        console.log(file);
        if (file && file.length > 0) {

            // if(!isValidFile(file)){
            //     return res.status(400).send({status : false, message : "This is not a valid image file"})
            // }

            let uploadedFileURL = await uploadFile(file[0]);

            data["profileImage"] = uploadedFileURL;
        } else {
            return res.status(400).send({ status: false, message: "No file found" });
        }

        let saveData = await user.create(data);
        return res.status(201).send({ status: true, message: "success", data: saveData });
    } catch (error) {
        return res.status(500).send({ status: "error", message: error.message });
    }
};

const logIn = async (req, res) => {
    try {
        let data = req.body;
        let { email, password } = data;

        if (!email || email.trim().length == 0) {
            return res.status(400).send({ status: false, message: "Email must be provide" });
        }

        if (email) {
            if (!isValidEmail(email)) {
                return res.status(400).send({ status: false, message: "please provide a valid email" });
            }
        }

        if (!password || password.length == 0) {
            return res.status(400).send({ status: false, message: "password must be provide" });
        }

        if (password.trim().length < 8 || password.trim().length > 15) {
            return res.status(400).send({ status: false, message: "plzz enter valid password" });
        }

        let emailExt = await user.findOne({ email: email });

        if (!emailExt) {
            return res.status(404).send({ status: false, message: "an account with this email does not exists" });
        }

        let comparePassword = await bcrypt.compare(password, emailExt.password);

        if (!comparePassword) {
            return res.status(400).send({ status: false, message: "Please provide right password" });
        } else {
            let params = {
                userId: emailExt._id,
                iat: Date.now(),
            };

            let secretKey = "vjfjdaehvkxfpekfpekfojdsopfjsdaoifji";

            let token = jwt.sign(params, secretKey, { expiresIn: "2h" });

            res.header("x-api-key", token);

            return res.status(200).send({
                status: true,
                message: "User logIn Successfull",
                data: { userId: emailExt._id, token: token },
            });
        }
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

const findProfile = async (req, res) => {
    try {
        let userId = req.params.userId;
        if (!userId) {
            return res.status(400).send({
                status: false,
                message: "User ID is required to do this action",
            });
        }

        let validUserId = mongoose.isValidObjectId(userId);

        if (!validUserId) {
            return res.status(400).send({ status: false, message: "please Provide a valid object Id" });
        }

        let findUser = await user.findOne({ _id: userId });

        if (!findUser) {
            return res.status(404).send({ status: false, message: "no user with this id exists" });
        } else {
            return res.status(200).send({ status: true, message: "success", data: findUser });
        }
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        let data = req.body;
        let id = req.params.userId;

        let { fname, lname, email, password, phone, address } = data;

        if (!id) {
            return res.status(400).send({
                status: false,
                message: "User id is required to do this action",
            });
        }

        let verifyId = mongoose.isValidObjectId(id);

        if (!verifyId) {
            return res.status(400).send({ status: false, message: "please Provide a valid user Id" });
        }

        if (req.userId != req.params.userId) {
            return res.status(403).send({ status: false, message: "you are not authorized" });
        }

        if (!isValidRequestBody(data)) {
            return res.status(400).send({ status: false, message: "please provide data to update" });
        }

        let findUser = await user.findOne({ _id: id });

        if (!findUser) {
            return res.status(404).send({ status: false, message: "No user with this Id exists" });
        }

        if (req.userId != findUser._id) {
            return res.status(403).send({
                status: false,
                message: "You can't update someone else's profile",
            });
        }


        if (fname == "") {
            return res.status(400).send({ status: false, message: "fname is invalid" });
        } else if (fname) {
            if (!isValid(fname))
                return res.status(400).send({ status: false, msg: "fname is missing" });

            if (!isValidName(fname)) {
                return res.status(400).send({ status: false, message: "name should contain only alphabets." })
            }
        }

        if (lname == "") {
            return res.status(400).send({ status: false, message: "last name is invalid" });
        } else if (lname) {
            if (!isValid(lname))
                return res.status(400).send({ status: false, msg: "last name is missing" });

            if (!isValidName(lname)) {
                return res.status(400).send({ status: false, message: "last name should contain only alphabets." })
            }
        }

        if (email == "") {
            return res.status(400).send({ status: false, messgae: "Email is invalid" })
        } else if (email) {
            if (!isValid(email)) {
                return res.status(400).send({ status: false, message: "plzz enter email" });
            }
            if (!isValidEmail(email)) {
                return res.status(400).send({ status: false, message: "This is not a valid email" });
            }

            email = email.toLowerCase().trim();

            const emailExt = await user.findOne({ email: email });
            if (emailExt) {
                return res.status(409).send({ status: false, message: "Email already exists" });
            }
        }

        if (phone == "") {
            return res.status(400).send({ status: false, message: "phone number is invalid" })
        } else if (phone) {
            if (!isValid(phone)) {
                return res
                    .status(400)
                    .send({ status: false, message: "plzz enter mobile" });
            }

            //this regex will to set the phone no. length to 10 numeric digits only.
            if (!isValidPhone(phone)) {
                return res
                    .status(400)
                    .send({
                        status: false,
                        message: "Please enter valid 10 digit mobile number.",
                    });
            }

            const phoneExt = await user.findOne({ phone: phone });
            if (phoneExt) {
                return res
                    .status(409)
                    .send({ status: false, message: "phone number already exists" });
            }
        }

        if (password == "") {
            return res.status(400).send({ status: false, message: "please enter a valid password" })
        } else if (password) {
            if (!isValid(password)) {
                return res.status(400).send({ status: false, message: "plzz enter password" });
            }
            if (password.length < 8 || password.length > 15) {
                return res.status(400).send({ status: false, message: "plzz enter valid password" });
            }

            let findPassword = await user.findById(req.params.userId);

            let same = bcrypt.compareSync(password, findPassword.password);
            if (same)
                return res.status(400).send({
                    status: false,
                    msg: "password is same as the last one, try another password or login again",
                });

            const salt = await bcrypt.genSalt(10);
            data.password = await bcrypt.hash(password, salt);
        }

        if (address == "") {
            return res.status(400).send({ status: false, message: "Please enter a valid address" })
        } else if (address) {
            address = JSON.parse(address);

            if (typeof address != "object") {
                return res.status(400).send({ status: false, message: "address should be an object" });
            }
            let { shipping, billing } = address;

            if (shipping) {
                if (typeof shipping != "object") {
                    return res.status(400).send({ status: false, message: "shipping should be an object" });
                }

                if (!isValid(shipping.street)) {
                    return res.status(400).send({ status: false, message: "shipping street is required" });
                }

                if (!isValid(shipping.city)) {
                    return res.status(400).send({ status: false, message: "shipping city is required" });
                }

                if (!isValidCity(shipping.city)) {
                    return res.status(400).send({
                            status: false,
                            message: "city field have to fill by alpha characters",
                        });
                }

                if (!isValid(shipping.pincode)) {
                    return res.status(400).send({ status: false, message: "shipping street is required" });
                }

                //applicable only for numeric values and extend to be 6 characters only--
                if (!isValidPincode(shipping.pincode)) {
                    return res.status(400).send({ status: false, message: "plz enter valid pincode" });
                }
            }

            if (billing) {
                if (typeof billing != "object") {
                    return res.status(400).send({ status: false, message: "billing should be an object" });
                }

                if (!isValid(billing.street)) {
                    return res.status(400).send({ status: false, message: "billing street is required" });
                }

                if (!isValid(billing.city)) {
                    return res.status(400).send({ status: false, message: "billing city is required" });
                }
                if (!isValidCity(billing.city)) {
                    return res.status(400).send({
                            status: false,
                            message: "city field have to fill by alpha characters",
                        });
                }

                if (!isValid(billing.pincode)) {
                    return res.status(400).send({ status: false, message: "billing street is required" });
                }

                //applicable only for numeric values and extend to be 6 characters only--
                if (!isValidPincode(billing.pincode)) {
                    return res.status(400).send({
                            status: false,
                            message: "plz enter valid  billing pincode",
                        });
                }
            }
            data.address = JSON.parse(data.address);
        }

        if (req.files && req.files.length > 0) {
            // uploading file and getting aws s3 link
            let files = req.files;

           /* 
            if(!isValidFile(files)){
                return res.status(400).send({status : false, message : "This is not a valid image file"})
            }
           */ 

            //upload to s3 and get the uploaded link
            let uploadedFileURL = await uploadFile(files[0]); // used var to declare uploadedFileURl in global scope
            data.profileImage = uploadedFileURL;
        }

        let updateData = await user.findOneAndUpdate(
            { _id: req.params.userId },
            { $set: { ...data }, updateAt: Date.now() },
            { new: true, upsert: true }
        );

        return res.status(200).send({
            status: true,
            message: "User Profile updated successfully",
            data: updateData,
        });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

module.exports = { createUser, logIn, findProfile, updateProfile };
