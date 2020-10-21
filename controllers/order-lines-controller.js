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
      styleNum: cart[i].styleNum,
      name: cart[i].name,
      image: cart[i].image,
      colour: cart[i].colour,
      size: cart[i].size,
      quantity: cart[i].quantity,
      price: cart[i].price,
      subtotal: cart[i].subtotal
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

  res.status(201).send(true);

  //get order id, hq and branch
  // let thisOrder;
  // try {
  //   thisOrder = await Order.findById(order).populate('user').populate('branch').populate('hq');
  // } catch (err) {
  //   const error = new HttpError(
  //     'Fetching Order failed, could not find Order.',
  //     500
  //   );
  //   return next(error);
  // }
  // try {
  //   sendOrder(thisOrder, cart)
  // } catch (err) {
  //   const error = new HttpError(
  //     'Sending order failed, please try again.',
  //     500
  //   );
  //   return next(error);
  // }
  // res.status(201).send(true);
};



const getOrderlinesByOrder = async (req, res, next) => {

  const orderID = req.params.oid
  let orderWithOrderlines;

  try {
    orderWithOrderlines = await Order.findById(orderID).populate('orderlines');
  } catch (err) {
    const error = new HttpError(
      `Fetching order lines failed, try again later. + ${err} `,
      500
    );
    return next(error);
  }

  if (!orderWithOrderlines || orderWithOrderlines.orderlines.length === 0) {
    return next(
      new HttpError('Could not find order items for the provided order.', 404)
    );
  }

  res.status(201).json({ orderlines: orderWithOrderlines.orderlines.map(orderline => orderline.toObject({ getters: true })) });
};



exports.createOrderline = createOrderline;
exports.getOrderlinesByOrder = getOrderlinesByOrder;

