const router = require('express').Router()
const {register} = require('../controller/vendor')
const {vendorSignUpValidator} = require('../middleware/validation')

router.post('/', vendorSignUpValidator, register)

module.exports = router