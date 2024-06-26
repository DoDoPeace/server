const express = require('express')

const router = express()

// 导入接口处理函数
const userApi = require('../router_handle/user')

// 导入验证表单的中间件
const expressJoi = require('@escook/express-joi')
// 导入验证规则
const {reg_login_schema} = require('../schema/user')

// 使用局部中间件
// 注册用户
router.post('/reguser', expressJoi(reg_login_schema), userApi.reguser)

// 用户登录
router.post('/login', expressJoi(reg_login_schema),userApi.login)

// 获取微博api
router.get('/hot',userApi.gethotlist)

// 留言板转发
router.post('/message',userApi.getMessage)

module.exports = router