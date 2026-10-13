const vendorModel = require('../model/vendor')
const otpGenerator = require('otp-generator')
const bcrypt = require('bcrypt');
const { sendSingleEmail } = require('../utils/brevo')
const { sendOTPEmail } = require('../email')

const generateOTP = () => ({
  otp: otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    specialChars: false,
    digits: true,
    lowerCaseAlphabets: false
  }),
  otpExpire: new Date(Date.now() + 1000 * 60 * 5)
});


exports.register = async (req, res, next) => {
    try{
        const {email, centreName, phoneNumber, password} = req.body

        const exisitingVendor = await vendorModel.findOne({email: email.toLowerCase()})
        if(exisitingVendor) {
            return res.status(404).json({
                message: "Vendor already exists"
            })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        const {otp, otpExpire} = generateOTP()

        const newVendor = new vendorModel({
            email: email.toLowerCase(),
            centreName,
            phoneNumber,
            password: hashedPassword,
            otp,
            otpExpire
        })

        res.status(201).json({
            message: "Account registered successfully. Please check your email for verification"
        })

        (async () => {
      try {
        await sendSingleEmail({
          email: email.toLowerCase(),
          name: `${centerName}`,
          html: await sendOTPEmail(`${centerName}`, otp),
          subject: "VERIFY OTP"
        })
      } catch (error) {
        console.error('Unable to send verification email:', error.message);
      }
    })()
    } catch (error) {
        console.log(error.message)
        next(error)
    }
}

exports.verifyEmail = async (req, res, next) => {
    try{
        const {email, otp} = req.body
        const exisitingVendor = await vendorModel.findOne({email: email.toLowerCase()})
        if(!exisitingVendor){
            return res.status(404).json({
                message: "Account doesn't exists"
            })
        }

        if (!client.otpExpire || Date.now() > client.otpExpire.getTime()) {
      return res.status(400).json({
        message: 'OTP has expired. Please request a new one.'
      });
    }

    if(exisitingVendor.otp !== otp){
        return res.status(400).json({
            message: "Invalid otp"
        })
    }

    exisitingVendor.isVerified= true;
    exisitingVendor.otp = undefined;
    exisitingVendor.otpExpire = undefined;
    await exisitingVendor.save()
    res.status(200).json({
        message: "Account verified successfully"
    })
    }catch (error) {
        console.log(error.message)
        next(error)
    }
}


exports.resendOtp = async (req, res, next) => {
    try{
        const {email} = req.body
        
    }catch(error){
        console.log(error.message)
        next(error)
    }
}