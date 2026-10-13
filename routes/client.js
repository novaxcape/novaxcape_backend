const router = require('express').Router();
const {create, verify, resendOtp, login, changePassword, forgetPassword, resetPassword, loginWithGoogle} = require('../controller/client')
const {authenticateToken, clientAuth} = require('../middleware/auth')
const {clientReg,verifyOtpReg,resendOtpReg,loginReg,changePasswordValidator,forgotPasswordValidator,resetPasswordValidator} = require('../middleware/validation')
const { profile, loginProfile } = require('../middleware/passport');


router.post('/', clientReg, create)
router.post('/verify', verifyOtpReg, verify)
router.post('/resendOtp', resendOtpReg, resendOtp)
router.post('/login', loginReg ,login)

router.post('/change-password', authenticateToken, clientAuth, changePasswordValidator, changePassword)
router.post('/forgot-password', forgotPasswordValidator, forgetPassword)
router.post('/reset-password', resetPasswordValidator, resetPassword)

router.get('/auth/google', profile);
router.get('/auth/google/callback', loginProfile, loginWithGoogle);

module.exports = router