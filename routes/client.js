const router = require('express').Router();
const {create} = require('../controller/client')

router.post('/', create)

module.exports = router