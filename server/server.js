import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import mysql from "mysql2";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;
const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const accessKey = process.env.ACCESS_KEY;
const secretKey = process.env.SECRET_KEY;

const db = mysql.createConnection({
  database: process.env.DATABASE,
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  port: process.env.DB_PORT,
});

db.connect((err) => {
  if (err) console.log(err);
  else console.log("Database connected");
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const s3 = new S3Client({
  region: bucketRegion,
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretKey,
  },
});

app.get("/", async (req, res) => {
  db.query("select * from postInfo", async (err, data) => {
    if (err) return res.send(err);
    for (const post of data) {
      const getObjectParams = {
        Bucket: bucketName,
        Key: post.imageTag,
      };
      const command = new GetObjectCommand(getObjectParams);
      const url = await getSignedUrl(s3, command, { expiresIn: 60 });
      post.url = url;
    }
    console.log(data);
    res.send(data);
  });
});

app.post("/url", async (req, res) => {
  const getObjectParams = {
    Bucket: bucketName,
    Key: req.body.key,
  };
  const command = new GetObjectCommand(getObjectParams);
  // const data = await s3.send(command);
  // console.log("data is ->", data);
  const url = await getSignedUrl(s3, command, { expiresIn: 60 });
  console.log(url);
  res.json(url);
});

app.post("/send", upload.single("photo"), async (req, res) => {
  console.log(req.body.text);
  console.log(req.file);
  const params = {
    Bucket: bucketName,
    Key: req.file.originalname,
    Body: req.file.buffer,
    ContentType: req.file.mimetype,
  };
  const command = new PutObjectCommand(params);
  const data = await s3.send(command);
  console.log("data is ->", data);
  res.redirect("/");
});

app.post("/assign", async (req, res) => {
  console.log(req.body);
  const key = `${req.body.key}-${Date.now()}`;
  const fileType = req.body.type;
  const caption = req.body.caption;
  const extension = fileType.split("/")[1];
  const fullKey = key + "." + extension;
  console.log(extension);
  const params = {
    Bucket: bucketName,
    Key: fullKey,
    ContentType: fileType,
  };
  console.log("ContentType is ", params.ContentType);
  const command = new PutObjectCommand(params);
  const url = await getSignedUrl(s3, command);
  let values = [caption, fullKey];
  db.query(
    "insert into postInfo (caption, imageTag) values (?)",
    [values],
    (err, data) => {
      if (err) {
        console.log(err);
        return res.json(err);
      }
      console.log(data);
    }
  );
  res.json(url);
});

app.listen(PORT, () => {
  console.log(`Listening at http://localhost:${PORT}`);
});
