const fs = require('fs');

const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const HttpError = require('../models/http-error');
const checkPermission = require('../utils/check-permission')

const Garment = require('../models/garment');
const User = require('../models/user');
const Cart = require('../models/cart');

const getCartByUser = async (req, res, next) => {
  const userID = req.params.uid
  let userWithCart;

  try {
    userWithCart = await User.findById(uid).populate('cart');
  } catch (err) {
    const error = new HttpError(
      `Fetching user cart failed, try again later. + ${err} `,
      500
    );
    return next(error);
  }

  res.json({ branches: hqWithBranches.branches.map(branch => branch.toObject({ getters: true })) });
};



const addToCart = async (req, res, next) => {
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



const removeFromCart = async (req, res, next) => {
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
    image: req.file.path,
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

exports.getCartByUser = getCartByUser;
exports.addToCart = addToCart;
exports.removeFromCart = removeFromCart;
