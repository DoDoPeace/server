const bcrypt = require('bcryptjs') // 密码加密
const puppeteer = require('puppeteer');
const db = require('../db/index')
// 用这个包来生成 Token 字符串
const jwt = require('jsonwebtoken')
// 导入配置文件
const config = require('../config')

const nodemailer = require('nodemailer');

// 创建一个发送邮件的函数
async function sendEmail(to, subject, message) {
  
    // 创建一个 SMTP 传输对象
    let transporter = nodemailer.createTransport({
        host: 'smtp.qq.com', // 你的 SMTP 服务器地址
        port: 587, // 你的 SMTP 服务器端口
        secure: false, // 如果是 465 端口则设为 true
        auth: {
            user: 'chenduonan@qq.com', // 你的邮箱账号
            pass: 'pkttycypgmaqbhja', // 你的邮箱密码
        },
    });

    // 邮件选项
    let mailOptions = {
        from: '"南瓜起始页" <chenduonan@qq.com>', // 发件人地址
        to: to, // 收件人地址
        subject: subject, // 邮件主题
        text: `联系方式：${message.concact} \n\n  内容：${message.content}`, // 邮件内容
    };

    // 发送邮件
    try {
        let info = await transporter.sendMail(mailOptions);
        return{status:0,message:'邮件发送成功'}
    } catch (error) {
        return{status:1,message:'邮件发送失败'}
    }
}

// 留言板
exports.getMessage = async (req, res) => {
  const messageInfo = req.body
  //插入数据
  const sql = 'insert into messageInfo set ?'

  db.query(sql,{content:messageInfo.content,concact:messageInfo.concact},(err,results) => {
    // 执行 SQL 语句失败
    // if (err) return res.send({ status: 1, message: err.message })
    if(err) return res.cc(err)
    // SQL 语句执行成功，但影响行数不为 1
    if (results.affectedRows !== 1) {
      // return res.send({ status: 1, message: '注册用户失败，请稍后再试！' })
      return res.cc('留言失败，请稍后再试！' )
    }
   })
  
  let result = await sendEmail('chenduonan@qq.com', '留言板内容', messageInfo);
  
  res.send(result)
}

// 注册新用户
exports.reguser = (req, res) => {
  // 接收表单数据
  const userinfo = req.body
  
  // 对表单数据进行合法校验
  if(!userinfo.username || !userinfo.password) {
    return res.send({status:1,message:'用户名和密码不合法'})
  }

  // 检测用户名是否被占用
  const sql = 'select * from ev_users where username = ?'
  db.query(sql,[userinfo.username],(err,results) => {
   
    // 执行sql语句失败了
    if(err) return console.log(err.message);

     // 成功了
    if(results.length > 0){
      return res.send({status:1,message:'用户名被占用'})
    }
    
    // 密码加密 返回字符串
    userinfo.password =  bcrypt.hashSync(userinfo.password,10)
    
    //插入数据
    const sql = 'insert into ev_users set ?'

    db.query(sql,{username:userinfo.username,password:userinfo.password},(err,results) => {
      // 执行 SQL 语句失败
      // if (err) return res.send({ status: 1, message: err.message })
      if(err) return res.cc(err)
      // SQL 语句执行成功，但影响行数不为 1
      if (results.affectedRows !== 1) {
        // return res.send({ status: 1, message: '注册用户失败，请稍后再试！' })
        return res.cc('注册用户失败，请稍后再试！' )
      }
      // 注册成功
      res.cc('注册成功~',0)
     })
  })


}

// 登录的处理函数
exports.login = (req, res) => {
  // 接收表单的数据
  const userinfo = req.body
  const sqlStr = 'select * from ev_users where username= ?'
  db.query(sqlStr,userinfo.username,(err,results) => {
    // 执行语句失败
    if(err) return res.cc(err)
    // 执行成功 都难受数据条数不等于1
    if(results.length !==1) return res.cc('登录失败')
    // res.send('登录成功！')

    // 判断密码是否正确
   const compareResults = bcrypt.compareSync(userinfo.password,results[0].password)
   
   if(!compareResults) return res.cc('密码错误')

   // 在服务器端生成token 剔除密码和头像的值
   const user = {...results[0],password:'',user_pic:""}
   
   // 生成 Token 字符串
   const tokenStr = jwt.sign(user, config.jwtSecretKey, {
      expiresIn: '10h', // token 有效期为 10 个小时
    })
    res.send({
      status:0,
      message:'登录成功',
      token:"Bearer " + tokenStr
    })
  }) 

}

// 获取用户信息
exports.userinfo = (req,res) => {
 const sqlStr = 'select id,username,nickname,email from ev_users where id = ?'
 
 // 注意 req对象上的auth属性 是token解析成功 express-jwt 中间件帮我们挂载上去的
 db.query(sqlStr,req.auth.id, (err, results) => {
  if(err) return res.cc(err.message)
  if(results.length !==1) return res.cc('获取用户信息失败')
//  let data =  []
//  results.map( i => {
//   data.push({
//     id:i.id,
//     username:i.username,
//     nickname:i.nickname,
//     email:i.email
//   })
  // })
  res.send({
    status:200,
    data:results[0]
  })
 })
}

// 更新用户信息 
exports.updateuserinfo = (req,res) => {
  const sqlStr = 'update ev_users set ? where id = ?'
  db.query(sqlStr,[req.body,req.body.id],(err,result) => {
    if(err) return res.cc(err.message)
    if(result.affectedRows !== 1) return res.cc('更新用户信息失败')
    res.send('更新成功！')
  })
 
}

// 更新用户密码
exports.updatepwd = (req,res) => {
  // 验证原密码是否正确
  const sqlStr = 'select password from ev_users where id = ?'
  db.query(sqlStr,req.auth.id,(err,results) => {
    if(err) return res.cc(err.message)

      // 判断密码是否正确
      const compareResults = bcrypt.compareSync(req.body.oldPwd,results[0].password)
   
      if(!compareResults) return res.cc('原密码错误,请重新设置')
      // 密码加密 返回字符串
       req.body.newPwd =  bcrypt.hashSync(req.body.newPwd,10)

      // 重新设置密码
      const sqlStr = 'update ev_users set ? where id = ?'
      db.query(sqlStr,[{password:req.body.newPwd},req.auth.id],(err,results) => {
        if(err) return res.cc(err.message)
        if(results.affectedRows !==1) return res.cc('更新密码失败')
        return res.send('更新密码成功')
      })
    
  })
    

}
// 获取微博热榜
async function fetchWeiboHotSearch() {
  const browser = await puppeteer.launch({ headless: true ,args: ['--no-sandbox', '--disable-setuid-sandbox']  });
  const page = await browser.newPage();

  await page.goto('https://s.weibo.com/top/summary', {
      waitUntil: 'networkidle2',
      timeout: 60000  // 设置超时时间
  });

  const data = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('#pl_top_realtimehot table tbody tr'));
    const hotSearchList = rows.slice(1).map(row => {
        const rank = row.querySelector('.td-01').innerText.trim();
        const titleElement = row.querySelector('.td-02 a');

        const title = titleElement.innerText.trim();
        const url = 'https://s.weibo.com' + titleElement.getAttribute('href');
        const hotValue = row.querySelector('.td-02 span').innerText.trim();

        return { rank, title, url, hotValue };
        });
        console.log('hotSearchList',hotSearchList);
        
        return hotSearchList;
    });

  await browser.close();
  console.log('dattta',data);
  
  return data;
}

exports.gethotlist = async (req,res) => {
  try {
    const data = await fetchWeiboHotSearch();
    res.send({ data });
} catch (error) {
  console.error('Error fetching Weibo hot search:', error);
    res.status(500).send({ error: 'Failed to fetch data' });
}
}

// 更新用户头像
exports.updateavatar = (req,res) => {

const sqlStr = 'update ev_users set user_pic = ? where id = ?'
db.query(sqlStr,[req.body.avatar,req.auth.id],(err,results) => {
  if(err) return res.cc(err.message)
  if(results.affectedRows !== 1) return res.cc('更换头像失败')
  
  res.cc('更换头像成功',200)
})

}