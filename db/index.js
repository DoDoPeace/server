// 导入模块
const mysql = require('mysql')

// 创建数据库连接对象
const db = mysql.createPool({
  host: '127.0.0.1',
  user: 'my_db_01',
  password: 'b3DzkLbKZirMhpGh',
  database: 'my_db_01',
})

module.exports = db