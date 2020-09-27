require('dotenv').config();
const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3')
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

// const fileUpload = multer({
//   limits: 500000,
//   storage: multer.diskStorage({
//     destination: (req, file, cb) => {
//       cb(null, 'uploads/images');
//     },
//     filename: (req, file, cb) => {
//       const ext = MIME_TYPE_MAP[file.mimetype];
//       cb(null, uuidv4() + '.' + ext);
//     }
//   }),
//   fileFilter: (req, file, cb) => {
//     const isValid = !!MIME_TYPE_MAP[file.mimetype];
//     let error = isValid ? null : new Error('Invalid mime type!');
//     cb(error, isValid);
//   }
// });

const fileUpload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'business-apparel',
    acl: 'public-read',
    metadata: (req, file, cb) => {
      cb(null, {fieldName: file.fieldname});
    },
    key: (req, file, cb) => {
      const ext = MIME_TYPE_MAP[file.mimetype];
      cb(null, uuidv4() + '.' + ext);
    }
  }),
  fileFilter: (req, file, cb) => {
    const isValid = !!MIME_TYPE_MAP[file.mimetype];
    let error = isValid ? null : new Error('Invalid mime type! Use only JPEG and PNG');
    cb(error, isValid);
  }
});

module.exports = fileUpload;
