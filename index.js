require("dotenv").config();
const AWS = require('aws-sdk')
const express = require("express");
const morgan = require("morgan");
const multer = require('multer');
const {v4: uuid} = require('uuid')
const upload = multer()
const app = express()
app.use(express.urlencoded({extended: true}))
app.use(morgan("dev"))
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET
})


app.post("/", upload.single('arquivo'), async (req, res) => {
    console.log()
    const fileSizeInMB = req.file.size / 1000000 
    if (fileSizeInMB > process.env.MAX_FILE_SIZE ){
        return res.status(400).json({erro: `Tamanho máximo do arquivo é  ${process.env.MAX_FILE_SIZE}MB`})
    }
    try{
        const options = {
            Bucket: process.env.AWS_BUCKET,
            Key: `${ uuid() + req.file.originalname}`,
            Body: req.file.buffer
        }
        s3.upload(options, (err, data) => {
            if(err) {
                throw(err)
            }
            res.end(data.Location)
        })
    } catch(e){
        res.status(500).json({erro: e})
    }

});
app.listen(8000, () => (console.log('http://localhost:8000')))