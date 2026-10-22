const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
    email:{
        type: String,
        required: true,
        unique: true
    },
    centreName:{
        type: String,
        required: true,
    },
    phoneNumber:{
        type: Number,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    isVerified:{
        type: Boolean,
        default: false
    },
    role:{
        type: String,
        default: 'Vendor'
    },
    otp:{
        type: String,
    },
    otpExpire:{
        type: Date,
         default: ()=>{
        return Date.now() + (1000*60*7)
    }
    }
}, {timestamps: true})

const vendorModel = mongoose.model('vendor', vendorSchema);
module.exports = vendorModel;
