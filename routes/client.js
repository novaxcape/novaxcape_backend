const router = require('express').Router();
const {create, verify, resendOtp, login} = require('../controller/client')
const {authenticateToken} = require('../middleware/auth')
const {clientReg,verifyOtpReg,resendOtpReg,loginReg} = require('../middleware/validation')

router.post('/', clientReg, create)
router.post('/verify', verifyOtpReg, verify)
router.post('/resendOtp', resendOtpReg, resendOtp)
router.post('/login', loginReg ,login)

module.exports = router