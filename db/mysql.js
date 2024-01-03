// 1. 导入 mysql 模块
const mysql = require('mysql')

// 2. 建立与 MySQL 数据库的连接关系
const db = mysql.createConnection({
  host: '127.0.0.1', // 数据库的 IP 地址
  user: 'root', // 登录数据库的账号
  password: '123456', // 登录数据库的密码
  port: '3306', // 端口
  database: 'zw_blog' // 指定要操作哪个数据库
})
// 进行数据库连接
db.connect();

// 测试数据库连接是否成功
// 查询数据库
const queryStr = 'SELECT 1+1 AS solution;'
db.query(queryStr, function (error, results, fields) {
  if (error) throw error;
  console.log('The solution is: ', results[0]);
});

module.exports = db