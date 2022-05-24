const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    title : {
        type : String,
        required : true,
        unique : true,
        trim : true
    },
     
    description : {
        type : String,
        required : true,
        trim : true
    },

    price : {
        type : Number, 
        required : true,
    },

    currencyId : {
        type : String,
        required : true,
        trim : true
    },

    
})