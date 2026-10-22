const vendorModel = require('../model/vendor')
const otpGenerator = require('otp-generator')
const bcrypt = require('bcrypt');
const { sendSingleEmail } = require('../utils/brevo')
const { sendOTPEmail, resetPasswordTemplate, resetPasswordSuccessfulTemplate } = require('../email');
const jwt = require('jsonwebtoken');

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
  try {
    const { email } = req.body;
    const normalizedEmail = email?.toLowerCase();
    const existingVendor = await vendorModel.findOne({ email: normalizedEmail });

    if (!existingVendor) {
      return res.status(404).json({
        message: 'Vendor not found'
      });
    }

    const { otp, otpExpire } = generateOTP();
    existingVendor.otp = otp;
    existingVendor.otpExpire = otpExpire;
    await existingVendor.save();

    const name = `${existingVendor.firstName} ${existingVendor.lastName}`;
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
    next(error)
  }
}

exports.login = async (req, res, next) => {
    try{
        const {email, password} = req.body
        const vendor = await vendorModel.findOne({email: email.toLowerCase()})
        if(!vendor) {
            return res.status(404).json({
                message: 'Invalid credentails'
            })
        }

        const correctPassword = await bcrypt.compare(password, vendor.password)
        if(!correctPassword){
            return res.status(400).json({
                message: 'Invalid credentails'
            })
        }

        if(vendor.isVerified === false){
            return res.status(400).json({
                message: 'Please verify your email'
            })
        }

        await vendor.save()

        const token = jwt.sign(
            { id: vendor._id, role: vendor.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

         res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000
    });

    const data = {
      id: vendor.id,
      centerName: vendor.centerName,
      email: vendor.email
    }

    res.status(200).json({
        message: 'Login successful',
        data
    })
    } catch (error) {
        console.log(error.message)
        next(error)
    }
}

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, digits: true, lowerCaseAlphabets: false });
    const otpExpire = new Date(Date.now() + 1000 * 60 * 5);
    const vendor = await vendorModel.findOne({ where: { email: email.toLowerCase() } })

    if (!vendor) {
      return res.status(404).json({
        message: 'Vendor not found'
      })
    }

    await vendor.update({ otp, otpExpire });

    res.status(200).json({
      message: 'Forgot password successful. Please check your email for OTP.'
    });

    (async () => {
      try {
        await sendSingleEmail({
          email: email.toLowerCase(),
          name: `${vendor.centerName}`,
          html: await sendOTPEmail(`${vendor.centerName}`, otp),
          subject: "Reset password"
        })
      } catch (error) {
        console.log(error.message)
      }
    })()
  } catch (error) {
    console.log(error.message)
    next(error);
  }
}

exports.resetPassword = async (req, res, next) => {
  try {
    const { password, email } = req.body
    const vendor = await vendorModel.findOne({ where: { email: email.toLowerCase() } })

    if (!vendor) {
      return res.status(404).json({
        message: 'Invalid credential'
      })
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt);

    await vendor.update({ password: hashedPassword });

    res.status(200).json({
      message: 'Password reset successful'
    })

  } catch (error) {
    next(error);
  }
}


exports.logout = async (req, res, next) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
    });

    return res.status(200).json({
      message: "Logout successful"
    });

  } catch (error) {
    next(error)
  }
};

