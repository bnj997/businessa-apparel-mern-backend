
require('dotenv').config();
const aws = require('aws-sdk');
const multer = require('multer');
const sharp = require('sharp')
const multerS3 = require('multer-s3-transform')
const { v4: uuidv4 } = require('uuid');


aws.config.update({
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  accessKeyId: process.env.ACCESS_KEY_ID,
  region: process.env.REGION
})

const s3 = new aws.S3();

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg'
};


const fileUpload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'business-apparel',
    acl: 'public-read',
    shouldTransform: function (req, file, cb) {
      cb(null, uuidv4() + '.' + 'jpeg')
    },
    transforms: [{
      key: (req, file, cb) => {
        cb(null, uuidv4() + '.' + 'jpeg');
      },
      transform: function (req, file, cb) {
        cb(null, sharp().resize(200, 250, {fit: 'contain', background: {r: 255, g: 255, b: 255} }).jpeg({quality: 80, chromaSubsampling: '4:4:4'}))
      }
    }],
    key: (req, file, cb) => {
      cb(null, uuidv4() + '.' + 'jpeg');
    },
    metadata: (req, file, cb) => {
      cb(null, {fieldName: file.fieldname});
    },
  }),
  fileFilter: (req, file, cb) => {
    const isValid = !!MIME_TYPE_MAP[file.mimetype];
    let error = isValid ? null : new Error('Invalid mime type! Use only JPEG and PNG');
    cb(error, isValid);
  }
});

// const fileUpload = multer({
//   storage: multerS3({
//     s3: s3,
//     bucket: 'business-apparel',
//     acl: 'public-read',
//     metadata: (req, file, cb) => {
//       cb(null, {fieldName: file.fieldname});
//     },
//     key: (req, file, cb) => {
//       const ext = MIME_TYPE_MAP[file.mimetype];
//       cb(null, uuidv4() + '.' + ext);
//     }
//   }),
//   fileFilter: (req, file, cb) => {
//     const isValid = !!MIME_TYPE_MAP[file.mimetype];
//     let error = isValid ? null : new Error('Invalid mime type! Use only JPEG and PNG');
//     cb(error, isValid);
//   }
// });

module.exports = fileUpload;
