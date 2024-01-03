const db = require('../db/mysql')
const app = require("express").Router()
const { SUCCESS_CODE } = require('../libs/constant')


//引入multer
const multer = require('multer')
//磁盘存储引擎，可以控制文件的存储，省略的话这些文件会保存在内存中，不会写入磁盘
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    //控制文件的存储路径，当前目录下的image/avatar
    cb(null, 'image/avatar')
  },
  filename: function (req, file, cb) {
    //定义上传文件存储时的文件名
    const [name, type] = file.originalname.split('.')
    const saveFileName = `${name}-${new Date().getTime()}.${type}`
    cb(null, saveFileName)
  }
})
const upload = multer({ storage })

// upload.single('avatar')：接受单文件上传
app.post('/update/avatar', upload.single('avatar'), function (req, res) {
  console.log('req.file:', req.file);
  const { filename, mimetype, destination, size, path } = req.file
  const avatarUrl = `http://127.0.0.1:8081/${destination.split('/')[1]}/${filename}`
  const info = {
    url: avatarUrl,
    filename,
    mimetype,
    size,
    path
  }
  res.selfCallback({ msg: '上传成功！', info })
})

module.exports = app