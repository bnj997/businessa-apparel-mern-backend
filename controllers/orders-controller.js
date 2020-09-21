const fs = require('fs');

const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const HttpError = require('../models/http-error');
const checkPermission = require('../utils/check-permission')
const sendEnquiryForm = require('../utils/send-enquiry')

const Order = require('../models/order');
const User = require('../models/user')


const getOrders = async (req, res, next) => {
  checkPermission(req.userData.username, next);
  let orders;
  try {
    orders = await Order.find().populate('hq').populate('branch');
  } catch (err) {
    const error = new HttpError(
      'Fetching Orders failed, please try again later.',
      500
    );
    return next(error);
  }
  res.json({ orders: orders.map(order => order.toObject({ getters: true })) });
};



const getOrdersByUser = async (req, res, next) => {
  const userId = req.params.uid
  let orders;
  try {
    orders = await Order.find({user : userId}).populate('hq').populate('branch');
  } catch (err) {
    const error = new HttpError(
      'Fetching Orders failed, please try again later.',
      500
    );
    return next(error);
  }
  res.json({ orders: orders.map(order => order.toObject({ getters: true })) });
};

const getOrderByID = async (req, res, next) => {
  const orderID = req.params.oid
  let order;
  try {
    order = await Order.findById(orderID).populate('hq').populate('branch');
  } catch (err) {
    const error = new HttpError(
      'Fetching Order failed, could not find Order.',
      500
    );
    return next(error);
  }
  res.json({order : order.toObject({ getters: true }) });
};


const createOrder = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }
  const { _id, user, info} = req.body;

  var userHQ = await User.findById(user).populate('hq')
  userHQ = userHQ.hq._id
  var userBranch = await User.findById(user).populate('branch')
  userBranch = userBranch.branch._id

  var dateFormatted = new Date();

  const createdOrder = new Order({
    _id,
    date: dateFormatted,
    hq: userHQ,
    branch: userBranch,
    user,
    info,
    orderlines: [],
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


const sendEnquiry = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  const {name, email, organisation , message} = req.body;

  try {
    sendEnquiryForm(name, email, organisation, message);
  } catch (err) {
    const error = new HttpError(
      'Sending form failed, please try again.',
      500
    );
    return next(error);
  }
  res.status(201).send(true);
};




exports.createOrder = createOrder;
exports.getOrdersByUser = getOrdersByUser;
exports.getOrders = getOrders;
exports.getOrderByID = getOrderByID;
exports.sendEnquiry = sendEnquiry;
