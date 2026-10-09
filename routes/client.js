const router = require('express').Router();
const {create, verify, resendOtp, login, changePassword, forgetPassword, resetPassword} = require('../controller/client')
const {authenticateToken, clientAuth} = require('../middleware/auth')
const {clientReg,verifyOtpReg,resendOtpReg,loginReg,changePasswordValidator,forgotPasswordValidator,resetPasswordValidator} = require('../middleware/validation')

router.post('/', clientReg, create)
router.post('/verify', verifyOtpReg, verify)
router.post('/resendOtp', resendOtpReg, resendOtp)
router.post('/login', loginReg ,login)

router.post('/change-password', authenticateToken, clientAuth, changePasswordValidator, changePassword)
router.post('/forgot-password', forgotPasswordValidator, forgetPassword)
router.post('/reset-password', resetPasswordValidator, resetPassword)

module.exports = router