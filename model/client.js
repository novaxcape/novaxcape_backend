const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
    lastName:{
        type: String,
        required: true,
        trim: true
    },
    fullName:{
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
    dafault: false
},
role:{
    type: String,
    dafault: 'Client'
}
})

const clientModel = mongoose.model('client', clientSchema);
module.exports = clientModel;