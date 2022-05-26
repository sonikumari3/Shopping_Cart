const isValidRequestBody = function (value) {
    return Object.keys(value).length > 0;
};

//validaton check for the type of Value --
const isValid = (value) => {
    if (typeof value == "undefined" || value == null) return false;
    if (typeof value == "string" && value.trim().length == 0) return false;
    if (typeof value === "number" && value.toString().trim().length === 0) return false;
    return true;
};

const isValidEmail = (value)=>{
    let emailPattern = /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})/g;
    if(emailPattern.test(value)){
        return true
    }else{
        return false
    }
}

const isValidPhone = (value)=>{
    let phonePattern = /^(\+91)?0?[6-9]\d{9}$/g
    if(phonePattern.test(value)){
        return true
    }else{
        return false
    }
}

const isValidName = (value)=>{
    let namePattern = /^[A-Za-z\s]{1,}[\.]{0,1}[A-Za-z\s]{0,}$/g

    if(namePattern.test(value)){
        return true
    }else{return false}
}

const isValidCity = (value)=>{
    let cityPattern = /^[a-zA-Z]+$/g

    if(cityPattern.test(value)){
        return true
    }else{
        return false
    }
}

const isValidPincode = (value)=>{
    let pinCodePattern = /^\d{6}$/g

    if(pinCodePattern.test(value)){
        return true
    }else{
        return false
    }
}

const isValidFile = (file) =>{
    let filePattern = /\.(gif|jpe?g|tiff?|png|webp|bmp)$/g

    if(filePattern.test(file.originalname)){
        return true
    }else{
        return false
    }
}

const isValidPrice = (value)=>{
    let priceRegex=/^\d+(,\d{3})*(\.\d{1,2})?$/g
    if(priceRegex.test(value)){
        return true
    }else{
        return false
    }
}


const isValidPassword = (value)=>{
    let passwordRegex = /^[a-zA-Z0-9!@#$%^&*]{8,15}$/g
    if(passwordRegex.test(value)){
        return true
    }else{
        return false
    }
}


module.exports = {
    isValid, 
    isValidEmail, 
    isValidName, 
    isValidPhone, 
    isValidRequestBody, 
    isValidCity, 
    isValidPincode,
    isValidFile,
    isValidPrice,
    isValidPassword
}