
const express = require('express')
const userApi = require('../router_handle/user')

const router = express()

// 导入验证表单的中间件
const expressJoi = require('@escook/express-joi')
// 导入验证规则
const {update_userinfo_schema,update_password_schema,update_avatar_schema} = require('../schema/user')

// 获取当前用户数据
router.post('/userinfo', userApi.userinfo)

// 更新用户信息
router.post('/updateuserinfo',expressJoi(update_userinfo_schema),userApi.updateuserinfo)

// 更新用户密码
router.post('/updatepwd',expressJoi(update_password_schema),userApi.updatepwd)

// 更新用户密码
router.post('/update/avatar',expressJoi(update_avatar_schema),userApi.updateavatar)

module.exports = router
