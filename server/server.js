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
  const getObjectParams = {
    Bucket: bucketName,
    Key: "tengen-uzui.png",
  };
  const command = new GetObjectCommand(getObjectParams);
  const url = await getSignedUrl(s3, command, { expiresIn: 10 });
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
  const key = req.body.key;
  const fileType = req.body.type;
  const params = {
    Bucket: bucketName,
    Key: key+'.png',
    ContentType: fileType,
  };
  console.log("ContentType is ", params.ContentType);
  const command = new PutObjectCommand(params);
  const url = await getSignedUrl(s3, command);
  res.json(url);
});

app.listen(PORT, () => {
  console.log(`Listening at http://localhost:${PORT}`);
});
