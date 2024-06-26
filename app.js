
const express = require('express')
const cors = require('cors')
const app = express()
const joi = require('joi')

// 导入路由模块
const userRouter = require('./router/user')
const userinfo = require('./router/userinfo')
const article = require('./router/artcate')

// 配置解析 `application/x-www-form-urlencoded` 格式的表单数据的中间件：
app.use(express.urlencoded({extends:false}))

const expressJwp = require('express-jwt')
const { func } = require('joi')

// 封装res.cc函数 定于中间件 （必须在路由之前）
app.use( (req,res,next) => {
  res.cc = (err,status = 1) =>  {
    res.send({
      status,
      err: err instanceof Error ? err.message : err 
    })
  }
  next()
})

// 解决接口跨域问题
app.use(cors()) 

const secretKey = 'iuiuiuiughg'
app.use(expressJwp.expressjwt({ 
  secret: secretKey,algorithms: ["HS256"]}).unless({path:[ /^\/api\//]}) ) // unless 匹配不需要权限的接口

app.use('/api',userRouter)
app.use('/my',userinfo)
app.use('/my/article',article)



// 错误中间件捕获校验错误
app.use((err,req,res,next) => {
  // 数据验证失败
  if (err instanceof joi.ValidationError) return res.cc(err)
   // 这次错误是由token 解析失败导致的
   if(err.name === 'UnauthorizedError'){
      return res.cc('身份认证失败==!',401)
  }
  // 未知错误
  res.cc(err)
})



app.listen(3007,() => {

  console.log('api_server 启动了 http://127.0.0.1:3007');

})
