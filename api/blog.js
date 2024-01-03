const db = require('../db/mysql')
const app = require("express").Router()
const { SUCCESS_CODE } = require('../libs/constant')
const { isEmpty} = require('../libs/utils')

// 博客分类和博客相关接口

// 新增博客分类
app.post('/addBlogType', function (req, res) {
  const { name } = req.body
  if (!name) {
    return res.selfCallback({
      code: '000002',
      msg: '分类名称为空，请检查！',
    })
  }
  // 判断该分类是否已存在
  db.query('select * from tb_blog_type;', (err, r) => {
    let typeNames = r.map(item => item.name)
    if (typeNames.includes(name)) {
      return res.selfCallback({
        code: '000002',
        msg: '该分类已存在，请检查！',
      })
    }
    const querySql = `insert into tb_blog_type(name) values('${name}')`
    db.query(querySql, (err, result) => {
      if (err) {
        return console.log('数据库操作失败了，addUser');
      }
      res.send({
        code: SUCCESS_CODE,
        msg: '操作成功'
      })
    })
  })
})

// 删除博客分类
app.post('/deleteBlogType', function (req, res) {
  const { id } = req.body
  // 判断该分类是否已存在
  db.query(`delete from tb_blog_type where id='${id}';`, (err, r) => {
    if (err) {
      return console.log('数据库操作失败了，addUser');
    }
    res.send({
      code: SUCCESS_CODE,
      msg: '操作成功'
    })
  })
})

// 查询博客分类列表
app.post('/getBlogType', function (req, res) {
  // 判断该分类是否已存在
  db.query(`select * from tb_blog_type;`, (err, r) => {
    if (err) {
      return console.log('数据库操作失败了，addUser');
    }
    const idList = r.map(ele => ele.id)
    const nameList = r.map(ele => ele.name)
    const info = idList.map((ele, index) => {
      return {
        id: ele,
        name: nameList[index]
      }
    })
    res.send({
      code: SUCCESS_CODE,
      info,
      msg: '操作成功'
    })
  })
})


// ============博客内容相关接口==========================
// 新增博客
app.post('/addBlog', function (req, res) {
  let { title, content, createTime, updateTime, description, views, typeId } = req.body
  // 判断该分类是否已存在
  const sqlStr = `insert into tb_blog(title,content,createTime,updateTime,description,typeId,views) values(?,?,?,?,?,?,?);`
  updateTime = updateTime || new Date().getTime()
  const sqlParams = [title, content, createTime, updateTime, description, typeId, views]
  db.query(sqlStr, sqlParams, (err, r) => {
    if (err) {
      return console.log('数据库操作失败了，addBlog');
    }
    res.send({
      code: SUCCESS_CODE,
      msg: '操作成功'
    })
  })
})

// 查询博客列表
app.post('/getBlogList', function (req, res) { 
  let sqlStr = 'select * from tb_blog where status=1'
  const { typeId, title, content, description, createTime, published } = req.body
  const searchKey = { typeId, title, content, description, createTime, published }
  // 后期需对某些字段添加模糊查询（待做）
  for (const key in searchKey) {
    if (!isEmpty(searchKey[key])) {
      if (['title','content','description'].includes(key)) {
        // 增加模糊查询
        sqlStr = sqlStr + ` and ${key} like '%${searchKey[key]}%'`
      } else {
        // 精确查询
        sqlStr = sqlStr + ` and ${key}='${searchKey[key]}'`
      }
    }
  }
  console.log('查询sql:', sqlStr);
  db.query(sqlStr, (err, result) => {
    if (err) {
      return console.log('查询数据库出错了！');
    }
    const info = result.map(ele => {
      const { id, typeId, title, content, firstPicture, published, description, createTime, updateTime, views} = ele
      return {
        id, typeId, title, content, firstPicture, published, description, createTime, updateTime, views
      }
    })
    res.selfCallback({
      code: SUCCESS_CODE,
      info,
      msg: '查询成功'
    })
  })
})

// 根据id获取博客详情
app.post('/getBlogDetail', function (req, res) { 
  db.query(`select * from tb_blog where id='${req.body.id}';`, (err, result) => {
    if (err) {
      return console.log('查询数据库出错了，getBlogDetail');
    }
    const list = result.map(ele => {
      const { id, typeId, title, content, firstPicture, published, description, createTime, updateTime, views } = ele 
      return {
        id, typeId, title, content, firstPicture, published, description, createTime, updateTime, views
      }
    })
    res.selfCallback({
      code: '000000',
      info: list.length > 0 ? list[0] : {},
      msg: '查询成功'
    })
  })
})

// 编辑博客信息
app.post('/editBlogById', function (req, res) {
  const { id, title, content, createTime, updateTime, description, typeId, views, firstPicture } = req.body
  const querySql = `update tb_blog set title='${title}', content='${content}', description='${description}', typeId='${typeId}',
  views='${views}', createTime='${createTime}', updateTime='${updateTime}', firstPicture='${firstPicture}' where id=${id};`
  db.query(querySql, async (err, r) => {
    if (err) {
      return console.log('数据库操作出错了、');
    }
    res.send({
      code: '000000',
      msg: '操作成功'
    })
  })
})

// 发布博客信息
app.post('/publishBlog', function (req, res) {
  const { id, published } = req.body
  const querySql = `update tb_blog set published='${published}' where id=${id};`
  db.query(querySql, async (err, r) => {
    if (err) {
      return console.log('数据库操作出错了、');
    }
    res.send({
      code: '000000',
      msg: '操作成功'
    })
  })
})

// 删除博客信息
app.post('/deleteBlog', function (req, res) {
  const { id } = req.body
  const querySql = `update tb_blog set status=0 where id=${id};`
  db.query(querySql, async (err, r) => {
    if (err) {
      return console.log('数据库操作出错了、');
    }
    res.send({
      code: '000000',
      msg: '操作成功'
    })
  })
})

module.exports = app