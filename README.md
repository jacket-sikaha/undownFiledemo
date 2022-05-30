# express+axios+multer实现文件上传下载

## 补充资料

multer([官网中文API](https://github.com/expressjs/multer/blob/master/doc/README-zh-cn.md))

[下载响应头说明补充链接](https://cloud.tencent.com/developer/article/1417956#:~:text=http%20%E5%8D%8F%E8%AE%AE%E5%AE%9E%E7%8E%B0%E6%96%87%E4%BB%B6%E4%B8%8B%E8%BD%BD%E6%97%B6%EF%BC%8C%E9%9C%80%E8%A6%81%E5%9C%A8%20%E6%9C%8D%E5%8A%A1%E5%99%A8%20%E8%AE%BE%E7%BD%AE%E5%A5%BD%E7%9B%B8%E5%85%B3%E5%93%8D%E5%BA%94%E5%A4%B4%EF%BC%8C%E5%B9%B6%E4%BD%BF%E7%94%A8%E4%BA%8C%E8%BF%9B%E5%88%B6%E4%BC%A0%E8%BE%93%E6%96%87%E4%BB%B6%E6%95%B0%E6%8D%AE%EF%BC%8C%E8%80%8C%E5%AE%A2%E6%88%B7%E7%AB%AF%EF%BC%88%E6%B5%8F%E8%A7%88%E5%99%A8%EF%BC%89%E4%BC%9A%E6%A0%B9%E6%8D%AE%E5%93%8D%E5%BA%94%E5%A4%B4%E6%8E%A5%E6%94%B6%E6%96%87%E4%BB%B6%E6%95%B0%E6%8D%AE%E3%80%82%20%E5%9C%A8,http%20%E5%93%8D%E5%BA%94%E6%8A%A5%E6%96%87%E4%B8%AD%EF%BC%8C%20Content-type%20%E5%92%8C%20Content-Disposition%20%E6%98%AF%E6%9C%80%E5%85%B3%E9%94%AE%E7%9A%84%E4%B8%A4%E4%B8%AA%E5%93%8D%E5%BA%94%E5%A4%B4%E3%80%82)

## 本地开发调试前提

```shell
//安装依赖
npm i
//启动
node server.js
```

## 客户端

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <h1>上传</h1>
    <form action="up" method="post" enctype="multipart/form-data">
       
            <input type="file" id="a" name="test" multiple>
       
            <input type="submit" value="提交">
            <input type="button" value="ajax提交" class="axio">
        </form>
        <hr>
        <div >
            <h1>下载列表</h1>
            <ul class="down">
                <li><a href="/t">test</a></li>
            </ul>

        </div>
        
</body>
<script src="https://cdn.bootcdn.net/ajax/libs/axios/0.27.2/axios.js"></script>
<script>
    let input = document.querySelector('#a')
    let down = document.querySelector('.down')
    input.addEventListener('change',(e)=>{
        // console.dir(e.target.files[0]);
    })

    function upFile(file) {
        let formData = new FormData();
        
        // console.dir(file.files);
        let fileList = [...file.files].forEach((value,index)=>{
            console.log(value);
            formData.append(`test`,value,value.name)
        })
        console.log(formData);

        axios({
            url: "/up",
            method: "post",
            headers: { "Content-Type": "multipart/form-data" },
            data: formData ,
        }).then(
            res =>{
                console.log(res)
                let {data} = res
                for(let i = 0;i < data.length;i++){
                    let newDoc = document.createElement('a')
                    let newLi = document.createElement('li')
                    newDoc.href = `/down?filename=${data[i].filename}`
                    newDoc.textContent = data[i].originalname
                    newLi.appendChild(newDoc)
                    down.appendChild(newLi)
                }
            }
        )
}
    document.querySelector('.axio').addEventListener('click',()=>{
        upFile(input)
    }) 
</script>
</html>
```

## 服务端

```js
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

```

