const fs = require('fs');

const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const HttpError = require('../models/http-error');
const checkPermission = require('../utils/check-permission')

const Order = require('../models/order');
const User = require('../models/user')
const Branch = require('../models/branch')

const createOrder = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }
  const { _id, user, date, info} = req.body;

  var userHQ = await User.findById(user).populate('hq')
  userHQ = userHQ.hq.name
  var userBranch = await Branch.find({users: { $all: [user] } })
  userBranch = userBranch[0].name


  const createdOrder = new Order({
    _id,
    date,
    hq: userHQ,
    branch: userBranch,
    user,
    info,
    orderlines: [],
    status: false,
  });

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdOrder.save(); 
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      'Creating Order failed, please try again.',
      500
    );
    return next(error);
  }
  res.status(201).json({ order: createdOrder.toObject({ getters: true }) });
};

exports.createOrder = createOrder;
