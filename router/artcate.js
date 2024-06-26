const express = require('express')

const router = express()

const artcate = require('../router_handle/artcate')

router.post('/cates',artcate.cates)

module.exports = router