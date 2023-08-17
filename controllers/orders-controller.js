const fs = require("fs");

const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const HttpError = require("../models/http-error");
const checkPermission = require("../utils/check-permission");
const sendEnquiryForm = require("../utils/send-enquiry");
const sendOrderForm = require("../utils/send-order");

const Order = require("../models/order");
const Orderline = require("../models/order-line");
const User = require("../models/user");

const getOrders = async (req, res, next) => {
  checkPermission(req.userData.username, next);
  let orders;
  try {
    orders = await Order.find().populate("hq").populate("branch");
  } catch (err) {
    const error = new HttpError(
      "Fetching Orders failed, please try again later.",
      500
    );
    return next(error);
  }
  res.json({
    orders: orders.map((order) => order.toObject({ getters: true })),
  });
};

const getOrdersByUser = async (req, res, next) => {
  const userId = req.params.uid;
  let orders;
  try {
    orders = await Order.find({ user: userId })
      .populate("hq")
      .populate("branch");
  } catch (err) {
    const error = new HttpError(
      "Fetching Orders failed, please try again later.",
      500
    );
    return next(error);
  }
  res.json({
    orders: orders.map((order) => order.toObject({ getters: true })),
  });
};

const getOrderByID = async (req, res, next) => {
  const orderID = req.params.oid;
  let order;
  try {
    order = await Order.findById(orderID).populate("hq").populate("branch");
  } catch (err) {
    const error = new HttpError(
      "Fetching Order failed, could not find Order.",
      500
    );
    return next(error);
  }

  res.json({ order: order.toObject({ getters: true }) });
};

const createOrder = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }
  const { _id, user, info } = req.body;

  var userHQ = await User.findById(user).populate("hq");
  userHQ = userHQ.hq._id;
  var userBranch = await User.findById(user).populate("branch");
  userBranch = userBranch.branch._id;

  var aestTime = new Date().toLocaleString("en-US", {
    timeZone: "Australia/Melbourne",
  });
  var date = new Date(aestTime);
  var dateString = `${date.toDateString()}, ${date.toLocaleTimeString()}`;

  const createdOrder = new Order({
    _id,
    date: dateString,
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
      "Creating Order failed, please try again.",
      500
    );
    return next(error);
  }
  res.status(201).json({ order: createdOrder.toObject({ getters: true }) });
};

const mergeOrders = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  // const sigIds = [
  //   "855270f0-07ad-4c4d-9bbd-64d93dde3964",
  //   "630ffad9-6923-1a3f-0831-9f2b87dfap32",
  //   "78d63670-f7ea-4ab5-bb3c-1ba3cb3e8642",
  //   "c880d530-4436-45ba-a3d7-c9f69f665db3",
  //   "a7e8ce26-2f6f-4375-bf70-900ca74ce900",
  //   "36cf4edb-54ff-4cdc-8bbf-37cf49bae65a",
  //   "24acf03a-4045-4b3d-920c-b18eeffeb52b",
  //   "956cd602-465d-44af-aeea-556e4f9c9af6",
  //   "baa17ad3-01ad-40b4-8ebe-a254421a19f1",
  //   "630ffb3f-6923-1a3f-0831-9f2c-8ap310a7er1g",
  //   "630ff9f9-69fd-74f1-0831-9f2af835js124",
  //   "85ddd88f-636b-458a-95f0-f8396345016a",
  //   "8bb9134a-c4e9-4e5e-aa7b-af15242fdeca",
  //   "71b6a583-9e34-4461-afbb-a557df60b163",
  // ];

  const sigIds = [
    "41eead67-5e64-4bbf-8a71-bd4fa490dd48",
    "a42a0ffc-6611-4317-9f41-5e6a73c485d6",
    "94e870d7-9df7-4988-bc4c-90e4bdf28e28",
  ];

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find all orders with hq field that matches an id in sigIds and update the hq field
    await Order.updateMany(
      { hq: { $in: sigIds } },
      { $set: { hq: "e5457924-497b-4f40-a2d0-2bc23aaa07d1" } },
      { session } // Pass the session to the updateMany options
    );

    await session.commitTransaction();

    res.status(200).json({ message: "Orders have been merged successfully" });
  } catch (err) {
    // Abort the transaction in case of an error
    await session.abortTransaction();

    console.log(err);
    const error = new HttpError(
      "Merging orders failed, please try again.",
      500
    );
    return next(error);
  } finally {
    // End the session whether there was an error or not
    session.endSession();
  }
};

const deleteOrder = async (req, res, next) => {
  const orderId = req.params.oid;

  let order;
  try {
    order = await Order.findById(orderId).populate("orderlines");
  } catch (err) {
    const error = new HttpError(
      `Something went wrong, could not delete order. + ${err}`,
      500
    );
    return next(error);
  }

  if (!order) {
    const error = new HttpError("Could not find order for this id.", 404);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await order.remove({ session: sess });
    await Orderline.deleteMany({ order: orderId });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      `Something went wrong, could not delete order. + ${err}`,
      500
    );
    return next(error);
  }

  res.status(200).json({ message: "Deleted order" });
};

const sendEnquiry = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { name, email, organisation, message } = req.body;

  try {
    sendEnquiryForm(name, email, organisation, message);
  } catch (err) {
    const error = new HttpError("Sending form failed, please try again.", 500);
    return next(error);
  }
  res.status(201).send(true);
};

const sendOrder = async (req, res, next) => {
  const order = req.params.oid;
  const { cart } = req.body;
  let thisOrder;
  try {
    thisOrder = await Order.findById(order)
      .populate("user")
      .populate("branch")
      .populate("hq");
  } catch (err) {
    const error = new HttpError(
      "Fetching Order failed, could not find Order.",
      500
    );
    return next(error);
  }
  try {
    sendOrderForm(thisOrder, cart);
  } catch (err) {
    const error = new HttpError("Sending order failed, please try again.", 500);
    return next(error);
  }
  res.status(201).send(true);
};

exports.createOrder = createOrder;
exports.getOrdersByUser = getOrdersByUser;
exports.mergeOrders = mergeOrders;
exports.getOrders = getOrders;
exports.deleteOrder = deleteOrder;
exports.getOrderByID = getOrderByID;
exports.sendEnquiry = sendEnquiry;
exports.sendOrder = sendOrder;
