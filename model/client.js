const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
    lastName:{
        type: String,
        required: true,
        trim: true
    },
    firstName:{
        type: String,
        required: true,
        trim: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    otp:{
        type: String,
    },
    otpExpire:{
        type: Date,
         default: ()=>{
        return Date.now() + (1000*60*7)
    }
},
isVerified:{
    type: Boolean,
    default: false
},
role:{
    type: String,
    default: 'Client'
}
})

const clientModel = mongoose.model('client', clientSchema);
module.exports = clientModel;
