const router = require('express').Router();
const {create, verify, resendOtp, login, changePassword} = require('../controller/client')
const {authenticateToken, clientAuth} = require('../middleware/auth')
const {clientReg,verifyOtpReg,resendOtpReg,loginReg} = require('../middleware/validation')

router.post('/', clientReg, create)
router.post('/verify', verifyOtpReg, verify)
router.post('/resendOtp', resendOtpReg, resendOtp)
router.post('/login', loginReg ,login)

router.post('/changePassword', authenticateToken, clientAuth, changePassword)

module.exports = router