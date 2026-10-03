const clientModel = required('../model/client')
const otpGenerator = require('otp-generator')
const bcrypt = require('bcrypt')
const { sendSingleEmail } = require('../utils/brevo');
const { autoCapitalizeFirstChar } = require('../helper/validateInput');
const { sendOTPEmail, resetPasswordTemplate, resetPasswordSuccessfulTemplate } = require('../email');


const generateOTP = () => ({
  otp: otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    specialChars: false,
    digits: true,
    lowerCaseAlphabets: false
  }),
  otpExpire: new Date(Date.now() + 1000 * 60 * 5)
});


exports.create = async (req, res) => {
    try{
        const {lastName, fullName, email, password} = req.body
        const normalizedFirstname = await autoCapitalizeFirstChar(firstName);
        const normalizedLastname = await autoCapitalizeFirstChar(lastName);

        const exisitingClient = await clientModel.findOne({email: email.toLowerCase()})

        if(!exisitingClient){
            return res.status(404).json({
                message: 'Client not found'
            })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        const { otp, otpExpire } = generateOTP();

        const newClient = new clientModel({
            lastName: normalizedLastname,
            fullName: normalizedFirstname,
            email: email.toLowerCase(),
            password: hashedPassword,
            otp,
            otpExpire
        })

        res.status(201).json({
            message: 'Client created sucessfully, Please check your email for verification.',
            data: newClient
        })
    

    (async () => {
      try {
        await sendSingleEmail({
          email: email.toLowerCase(),
          name: `${normalizedFirstname} ${normalizedLastname}`,
          html: await sendOTPEmail(`${normalizedFirstname} ${normalizedLastname}`, otp),
          subject: "VERIFY OTP"
        })
      } catch (error) {
        await newClient.deleteOne();
      }
    })()
  
    } catch(error){
        console.log(error.message)
        res.status(500).json({
            message: 'Something went wrong'
        })
    }
}