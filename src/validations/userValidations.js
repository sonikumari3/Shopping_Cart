const {check, validationResult} = require("express-validator")

exports.userValidation = [check('fname')
.trim()
.not()
.isEmpty().withMessage('first name is Missing')
.matches(/^[a-zA-Z ]+$/g)
.withMessage('this is not a first name'),

check('lname')
.trim()
.not()
.isEmpty().withMessage('last name is Missing')
.matches(/^[a-zA-Z ]+$/g)
.withMessage('this is not a first name'),

check('email')
.not()
.isEmpty().withMessage('Email is a required field')
.normalizeEmail()
.isEmail()
.withMessage('Email is Invalid'),

check('phone')
.trim()
.not()
.isEmpty().withMessage('Phone number is missing')
.matches('^[6789][0-9]{9}$')
.withMessage('Not a valid phone number'),

check('password')
.trim()
.not()
.isEmpty().withMessage('password is Missing')
.isLength({ min: 8, max: 15})
.withMessage(' Password must be within 8 to 15 characters long'),
]


exports.userResults = async (req, res, next)=>{
    const error = validationResult(req).array()
    if(!error.length) return next()

    res.status(400).send({status : false, msg: error[0].msg})
}