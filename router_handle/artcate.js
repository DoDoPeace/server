const db = require("../db")


// 获取文章分类列表的处理函数
exports.cates = (req,res) => {
  
  // 查询数据库
  const sqlStr = 'select * from ev_article_cate where is_delete = 0'
  db.query(sqlStr,(err,results) => {
    if(err) return res.cc(err.message)
    res.send({
      status:200,
      massage:'获取数据成功',
      data:results
    })
  })
}

