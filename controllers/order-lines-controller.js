const fs = require('fs');

const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const HttpError = require('../models/http-error');
const checkPermission = require('../utils/check-permission')

const Order = require('../models/order');
const OrderLine = require('../models/order-line');

const createOrderline = async (req, res, next) => {
  const order = req.params.oid;
  const orderOfInterest = await Order.findById(order);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  const {cart} = req.body;

  for (var i = 0; i < cart.length; i++) {
    var uniqueID = uuidv4()
    const createdOrderline = new OrderLine({
      _id: uniqueID,
      order: order,
      garment: cart[i].id,
      colour: cart[i].colour,
      size: cart[i].size,
      quantity: cart[i].quantity,
    });


    try {
      const sess = await mongoose.startSession();
      sess.startTransaction();
      orderOfInterest.orderlines.push(uniqueID)
      await createdOrderline.save({ session: sess }); 
      await orderOfInterest.save({ session: sess }); 
      await sess.commitTransaction();
    } catch (err) {
      const error = new HttpError(
        'Creating Order Line failed, please try again.',
        500
      );
      return next(error);
    }
  }
  res.status(201).json({orderLine: createdOrderline.toObject({ getters: true }) });
};

exports.createOrderline = createOrderline;

