const clientModel = require('../model/client')
const otpGenerator = require('otp-generator')
const bcrypt = require('bcrypt')
const { sendSingleEmail } = require('../utils/brevo');
const { autoCapitalizeFirstChar } = require('../helper/validateInput');
const { sendOTPEmail, resetPasswordTemplate, resetPasswordSuccessfulTemplate } = require('../email');
const jwt = require('jsonwebtoken')


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
        const {lastName, firstName, email, password} = req.body
        const normalizedFirstname = await autoCapitalizeFirstChar(firstName);
        const normalizedLastname = await autoCapitalizeFirstChar(lastName);

        const exisitingClient = await clientModel.findOne({email: email.toLowerCase()})

        if(exisitingClient){
            return res.status(400).json({
                message: 'Client already exists'
            })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        const { otp, otpExpire } = generateOTP();

        const newClient = new clientModel({
            lastName: normalizedLastname,
            firstName: normalizedFirstname,
            email: email.toLowerCase(),
            password: hashedPassword,
            otp,
            otpExpire
        })

        await newClient.save()

        res.status(201).json({
            message: 'Client created sucessfully, Please check your email for verification.',
            data: newClient
        });
    

    (async () => {
      try {
        await sendSingleEmail({
          email: email.toLowerCase(),
          name: `${normalizedFirstname} ${normalizedLastname}`,
          html: await sendOTPEmail(`${normalizedFirstname} ${normalizedLastname}`, otp),
          subject: "VERIFY OTP"
        })
      } catch (error) {
        // Email delivery is separate from account creation. Keep the saved
        // client so a temporary email provider failure cannot erase it.
        console.error('Unable to send verification email:', error.message);
      }
    })();
  
    } catch(error){
        console.log(error.message)
        res.status(500).json({
            message: 'Something went wrong'
        })
    }
}


exports.verify = async (req, res) => {
    try{
      const {email, otp} = req.body
      const client = await clientModel.findOne({email: email.toLowerCase()})
      if(!client){
        return res.status(400).json({
          message: 'Client not found'
        })
      }

      // if(client.isVerified){
      //   return res.status(400).json({
      //     message: 'Client is already verified'
      //   })
      // }

      if (!client.otpExpire || Date.now() > client.otpExpire.getTime()) {
      return res.status(400).json({
        message: 'OTP has expired. Please request a new one.'
      });
    }

      if(client.otp !== otp){
        return res.status(400).json({
          message: 'Invalid OTP'
        })
      }
      client.isVerified = true;
      client.otp = undefined;
      client.otpExpire = undefined;
      await client.save()
      res.status(200).json({
        message: 'Client verified successfully'
      })
    } catch(error){
        console.log(error.message)
        res.status(500).json({
            message: 'Something went wrong'
        })
    }
}


exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = email?.toLowerCase();
    const existingClient = await clientModel.findOne({ email: normalizedEmail });

    if (!existingClient) {
      return res.status(404).json({
        message: 'Client not found'
      });
    }

    const { otp, otpExpire } = generateOTP();
    existingClient.otp = otp;
    existingClient.otpExpire = otpExpire;
    await existingClient.save();

    const name = `${existingClient.firstName} ${existingClient.lastName}`;
    sendOTPEmail(name, otp)
      .then(html => sendSingleEmail({
        email: normalizedEmail,
        name,
        html,
        subject: 'RESEND: VERIFY OTP'
      }))
      .catch(error => {
        console.error('Unable to resend verification email:', error.message);
      });

    return res.status(200).json({
      message: 'OTP resent successfully. Please check your email.'
    });

  } catch (error) {
    console.error(error.message);
    if (res.headersSent) return;
    return res.status(500).json({
      message: 'Something went wrong'
    });
  }
}


exports.login = async (req, res) => {
  try {
    const {email, password} = req.body
    const existingClient = await clientModel.findOne({email: email.toLowerCase()})
    if(!existingClient){
      return res.status(404).json({
        message: "Invalid credentail"
      })
    }

    const correctPassword = await bcrypt.compare(password, existingClient.password)
    if(!correctPassword){
      return res.staus(400).json({
        message: 'Invalid credentails'
      })
    }

    if(existingClient.isVerified === false){
      return res.status(400).json({
        message: 'Please verify your email'
      })
    }

    await existingClient.save()

    const token = jwt.sign(
      { id: existingClient.id, role: existingClient.role },
      process.env.SECERT_KEY,
      { expiresIn: '1d' }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000
    });
    const data = {
      id: existingClient.id,
      email: existingClient.email,
      role: existingClient.role,
      firstName: existingClient.firstName,
      lastName: existingClient.lastName
    }

    res.status(200).json({
      message: "Login successfully",
      data
    })

  } catch(error){
    console.log(error.message)
    res.status(500).json({
      message: 'Something went wrong'
    })
  }
}


exports.changePassword = async (req, res) => {
  try {
        if (!req.user || !req.user.id) {
      return res.status(401).json({
        message: 'Unauthorized - Invalid token'
      });
    }

    const {oldPassword, newPassword} = req.body
    const clientData = await clientModel.findById(req.user.id)
    if(!clientData) {
      return res.status(404).json({
        message: "Client not found"
      })
    }

    const checkPassword = await bcrypt.compare(oldPassword, clientData.password)
    if(!checkPassword){
      return res.status(400).json({
        message: "Password is invalid"
      })
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newPassword, salt)

    clientData.password = hashedPassword
    await clientData.save()
    res.status(200).json({
      message: "Password changed successfully",
      data: clientData
    })
  } catch(error) {
    console.log(error.message)
    res.status(500).json({
      message: 'Something went wrong'
    })
  }
}



exports.forgetPassword = async (req, res) => {
  try {
    const {email} = req.body
    const checkClient = await clientModel.findOne({email: email.toLowerCase()})
    if(!checkClient){
      return res.status(404).json({
        message: "Cleint not found"
      })
    }

    const { otp, otpExpire } = generateOTP()

    checkClient.otp = otp
    checkClient.otpExpire = otpExpire
    await checkClient.save()

    res.status(200).json({
      message: "Forgotten password successfully. Please check your email for verification.",
    });

    (async () => {
      try {
        const name = `${checkClient.firstName} ${checkClient.lastName}`;
        await sendSingleEmail({
          email: email.toLowerCase(),
          name,
          html: await sendOTPEmail(name, otp),
          subject: "Reset password"
        })
      } catch (error) {
        console.error('Unable to send password reset email:', error.message);
      }
    })()

  } catch(error){
    console.log(error.message)
    if (res.headersSent) return;
    res.status(500).json({
      message: 'Something went wrong'
    })
  }
}


exports.resetPassword = async (req,res) => {
  try{
    const {email, password} = req.body
    const checkClient = await clientModel.findOne({email: email.toLowerCase()})
    if(!checkClient){
      return res.status(404).json({
        message: "Client not found"
      })
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    checkClient.password = hashedPassword
    checkClient.otp = undefined
    checkClient.otpExpire = undefined
    await checkClient.save()

    return res.status(200).json({
      message: "Password reset successfully"
    })

  }catch (error){
    console.log(error.message)
    if (res.headersSent) return;
    res.status(500).json({
      message: "Something went wrong"
    })
  }
}
