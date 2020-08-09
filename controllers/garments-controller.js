
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const HttpError = require('../models/http-error');

const Garment = require('../models/garment');
const HQ = require('../models/hq');

const getAllGarments = async (req, res, next) => {
  let garments;
  try {
    garments = await Garment.find();
  } catch (err) {
    const error = new HttpError(
      'Fetching Garmentss failed, please try again later.',
      500
    );
    return next(error);
  }
  res.json({ garments: garments.map(garment => garment.toObject({ getters: true })) });
};



const getGarmentsByHqID = async (req, res, next) => {
  const hqID = req.params.hqid
  let hqWithGarments;

  try {
    hqWithGarments = await HQ.findById(hqID).populate('garments');
  } catch (err) {
    const error = new HttpError(
      `Fetching garments failed, try again later. + ${err} `,
      500
    );
    return next(error);
  }


  if (!hqWithGarments || hqWithGarments.garments.length === 0) {
    return next(
      new HttpError('Could not find garments for the provided HQ id.', 404)
    );
  }

  res.json({ garments: hqWithGarments.garments.map(garment => garment.toObject({ getters: true })) });
};



const createGarment = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError(`Creating Garment Failed. Invalid inputs passed, please check your data.`, 422)
    );
  }

  const { _id, styleNum, name, price, category, supplier, description, colours, sizes} = req.body;
  const createdGarment = new Garment({
    _id,
    styleNum,
    name,
    price,
    category,
    supplier,
    description,
    colours,
    sizes,
    hqs: []
  });
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();

    await createdGarment.save(); 
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      'Creating Garment failed, please try again.',
      500
    );
    return next(error);
  }
  res.status(201).json({ garment: createdGarment.toObject({ getters: true }) });
};



const updateGarment = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  const {styleNum, name, price, category, supplier, description, colours, sizes} = req.body;
  const garmentID = req.params.gid;

  let garment;
  try {
    garment = await Garment.findById(garmentID);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not update Garment.',
      500
    );
    return next(error);
  }
  
  garment.styleNum = styleNum;
  garment.name = name;
  garment.price = price;
  garment.category = category;
  garment.supplier = supplier;
  garment.description = description;
  garment.colours = colours;
  garment.sizes = sizes;

  try {
    await garment.save();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not update Garment.',
      500
    );
    return next(error);
  }

  res.status(200).json({ garment: garment.toObject({ getters: true }) });
};


const deleteGarment = async (req, res, next) => {
  const garmentID = req.params.gid;

  let garment;
  try {
    garment = await Garment.findById(garmentID);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete garment.',
      500
    );
    return next(error);
  }

  if (!garment) {
    const error = new HttpError('Could not find garment for this id.', 404);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await garment.remove({session: sess});
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete garment.',
      500
    );
    return next(error);
  }
  
  res.status(200).json({ message: 'Deleted garment.' });
};

exports.getAllGarments = getAllGarments;
exports.getGarmentsByHqID = getGarmentsByHqID;
exports.createGarment = createGarment;
exports.updateGarment = updateGarment;
exports.deleteGarment = deleteGarment;