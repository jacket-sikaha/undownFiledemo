const express = require("express");
const cors = require("cors");
const app = express();
const multer = require("multer");
// const upload = multer({ dest: "uploads/" });

const storage = multer.diskStorage({
  //自定义存储位置
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  //自定义上传文件的重命名
  filename: function (req, file, cb) {
    // console.log(file);
    let { originalname } = file;
    cb(null, Date.now() + originalname.slice(originalname.lastIndexOf(".")));
    // cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

app.use(cors());

app.get("/", (req, res) => {
  //相当于跳转，但实际是返回资源给浏览器显示(响应头不调整的情况)
  res.sendFile(__dirname + "/index.html");
});

//test
app.get("/t", (req, res) => {
  //下载所需响应头
  res.setHeader("Content-type", "application/octet-stream");
  //！！！响应头里不允许带中文
  res.setHeader("Content-Disposition", `attachment;filename=asd.jpg`);
  // res.setHeader("Content-type", "application/force-download");

  res.sendFile(__dirname + "/uploads/QQ图片20200621185630.jpg");
});

app.get("/down", (req, res) => {
  let { filename } = req.query;
  console.log(filename);
  //下载所需响应头
  res.setHeader("Content-type", "application/octet-stream");
  res.setHeader("Content-Disposition", `attachment;filename=${filename}`);
  // res.setHeader("Content-type", "application/force-download");
  res.sendFile(__dirname + `/uploads/${filename}`);
});

//test是对应input标签的name属性
app.post("/up", upload.array("test", 12), (req, res) => {
  console.log(req.files);
  let filenameList = req.files.map(({ originalname, filename }) => ({
    originalname,
    filename,
  }));
  res.send(filenameList);
});

app.use(express.static("../node_fs")); //不加前缀,目录名uploads不会出现在url路径上

app.listen(3000, () => {
  console.log("server start!!!");
});
