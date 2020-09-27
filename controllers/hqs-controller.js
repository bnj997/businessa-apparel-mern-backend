const fs = require('fs');

const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const HttpError = require('../models/http-error');
const checkPermission = require('../utils/check-permission')

const Garment = require('../models/garment');
const User = require('../models/user');
const Branch = require('../models/branch');
const HQ = require('../models/hq');

const aws = require('aws-sdk');
aws.config.update({
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  accessKeyId: process.env.ACCESS_KEY_ID,
  region: process.env.REGION
})
const s3 = new aws.S3();


const getAllHQs = async (req, res, next) => {
  checkPermission(req.userData.username, next);

  let hqs;
  try {
    hqs = await HQ.find();
  } catch (err) {
    const error = new HttpError(
      'Fetching HQs failed, please try again later.',
      500
    );
    return next(error);
  }
  res.json({ hqs: hqs.map(hq => hq.toObject({ getters: true })) });
};



const getHQById = async (req, res, next) => {
  checkPermission(req.userData.username, next);

  const hqID = req.params.hid
  let hq;
  try {
    hq = await HQ.findById(hqID);
  } catch (err) {
    const error = new HttpError(
      'Fetching HQ failed, could not find HQ.',
      500
    );
    return next(error);
  }
  res.json({hq : hq.toObject({ getters: true }) });
};



const createHQ = async (req, res, next) => {
  checkPermission(req.userData.username, next);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }
  const { _id, name, telephone, email} = req.body;
  const createdHQ = new HQ({
    _id,
    image: req.file.location,
    name,
    telephone,
    email,
    garments: []
  });
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdHQ.save(); 
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      'Creating HQ failed, please try again.',
      500
    );
    return next(error);
  }
  res.status(201).json({ hq: createdHQ.toObject({ getters: true }) });
};



const updateHQ = async (req, res, next) => {
  checkPermission(req.userData.username, next);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  const { name, telephone, email } = req.body;
  const hqID = req.params.hid;

  let hq;
  try {
    hq = await HQ.findById(hqID);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not update HQ.',
      500
    );
    return next(error);
  }

  //if you updated image
  if (req.file !== undefined) {
    const imageLocation = hq.image.replace('https://business-apparel.s3.ap-southeast-2.amazonaws.com/','');
    var params = {
      Bucket: "business-apparel", 
      Key: imageLocation
    };
    s3.deleteObject(params, function(err, data) {
      if (err) console.log(err, err.stack); // an error occurred
      else     console.log(data);           // successful response
    });
    hq.image = req.file.location
  };

  hq.name = name;
  hq.telephone = telephone;
  hq.email = email;

  try {
    await hq.save();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not update HQ.',
      500
    );
    return next(error);
  }

  res.status(200).json({ hq: hq.toObject({ getters: true }) });
};


const deleteHQ = async (req, res, next) => {
  checkPermission(req.userData.username, next);

  const hqID = req.params.hid;

  let hq;
  let garmentsToRemoveFromHQ;
  try {
    hq = await HQ.findById(hqID);
    garmentsToRemoveFromHQ = await Garment.find( { hqs: { $all: [hqID]} }  )
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete hq.',
      500
    );
    return next(error);
  }

  if (!hq) {
    const error = new HttpError('Could not find hq for this id.', 404);
    return next(error);
  }

  const imageLocation = hq.image.replace('https://business-apparel.s3.ap-southeast-2.amazonaws.com/','');

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await User.deleteMany({hq: hqID})
    await Branch.deleteMany({hq: hqID})
    await hq.remove({session: sess});


    for (var i = 0; i < garmentsToRemoveFromHQ.length; i++) {
      var index = garmentsToRemoveFromHQ[i].hqs.indexOf(hqID)
      garmentsToRemoveFromHQ[i].hqs.splice(index, 1)
      await garmentsToRemoveFromHQ[i].save({ session: sess }); 
    }


    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete hq.',
      500
    );
    return next(error);
  }

  var params = {
    Bucket: "business-apparel", 
    Key: imageLocation
  };
  s3.deleteObject(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else     console.log(data);           // successful response
  });
 
  
  res.status(200).json({ message: 'Deleted hq.' });
};

exports.getAllHQs = getAllHQs;
exports.getHQById = getHQById;
exports.createHQ = createHQ;
exports.updateHQ = updateHQ;
exports.deleteHQ = deleteHQ;