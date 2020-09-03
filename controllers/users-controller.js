const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const mongoose = require('mongoose');
const HttpError = require('../models/http-error');
const checkPermission = require('../utils/check-permission')

const User = require('../models/user');
const Branch = require('../models/branch');
const HQ = require('../models/hq');

const createUser = async (req, res, next) => {
  checkPermission(req.userData.username, next);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError(`Creating User Failed. Invalid inputs passed, please check your data.`, 422)
    );
  }
  const { _id, hq, branch, username, email, password} = req.body;
  // const { username, password} = req.body;
  
  let existingUser;
  try {
    existingUser = await User.findOne({ username: username });
  } catch (err) {
    const error = new HttpError(
      'Creating user failed, please try again later.',
      500
    );
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError(
      'User exists already, please change username instead.',
      422
    );
    return next(error);
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12)
  } catch(err) {
    const error = new HttpError(
      'Could not create user, please try again.',
      500
    );
    return next(error)
  }
  
  const createdUser = new User({
    _id,
    hq,
    branch,
    username,
    email,
    password: hashedPassword, 
  });

  let hqMain;
  let branchMain
  try {
    hqMain = await HQ.findById(hq);
    branchMain = await Branch.find({"name": branch});
  } catch (err) {
    const error = new HttpError(
      `Creating user failed, please try again. + ${err}`,
      500
    );
    return next(error);
  }

  if (!hqMain) {
    const error = new HttpError('Could not find hq for provided id.', 404);
    return next(error);
  }

  if (!branchMain[0]) {
    const error = new HttpError('Could not find branch for provided id.', 404);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdUser.save(); 
    branchMain[0].users.push(createdUser)
    hqMain.users.push(createdUser)
    await branchMain[0].save({session: sess })
    await hqMain.save({session: sess })
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      `Creating user failed, please try again. + ${err}`,
      500
    );
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: createdUser._id, username: createdUser.username },
      'supersecret_dont_share',
      { expiresIn: '1h' }
    );
  } catch (err) {
    const error = new HttpError(
      'Creating user failed, please try again later.',
      500
    );
    return next(error);
  }

  res
  .status(201)
  .json({ userId: createdUser._id, username: createdUser.username, token: token });
};


const login = async (req, res, next) => {
  const { username, password } = req.body;
  let existingUser;
  try {
    existingUser = await User.findOne({ username: username });
  } catch (err) {
    const error = new HttpError(
      'Logging in failed, please try again later.',
      500
    );
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError(
      'Invalid credentials, could not log you in.',
      401
    );
    return next(error);
  }


  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch(err) {
    const error = new HttpError(
      'Could not log you in, please check your credentials and try again.',
      500
    );
    return next(error);
  }

  if (!isValidPassword) {
    const error = new HttpError(
      'Invalid credentials, could not log you in.',
      403
    );
    return next(error);
  }


  let token;
  try {
    token = jwt.sign(
      { userId: existingUser._id, username: existingUser.username },
      'supersecret_dont_share',
      { expiresIn: '1h' }
    );
  } catch (err) {
    const error = new HttpError(
      'Logging in failed, please try again later.',
      500
    );
    return next(error);
  }

  res.json({
    userId: existingUser._id,
    username: existingUser.username,
    token: token
  });
};



const getUsersByHqID = async (req, res, next) => {
  checkPermission(req.userData.username, next);

  const hqID = req.params.hid
  let hqWithUsers;

  try {
    hqWithUsers = await HQ.findById(hqID).populate('users');
  } catch (err) {
    const error = new HttpError(
      `Fetching users failed, try again later. + ${err} `,
      500
    );
    return next(error);
  }

  // if (!hqWithUsers || hqWithUsers.users.length === 0) {
  //   return next(
  //     new HttpError('Could not find users for the provided HQ id.', 404)
  //   );
  // }
  res.json({ users: hqWithUsers.users.map(user => user.toObject({ getters: true })) });
};


const updateUser = async (req, res, next) => {
  checkPermission(req.userData.username, next);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError(`Invalid inputs passed, please check your data`, 422)
    );
  }
  const {branch, username, email, password} = req.body;
  const userId = req.params.uid;

  let user;
  try {
    user = await User.findById(userId);
  } catch (err) {
    const error = new HttpError(
      `Something went wrong, could not update user.` ,
      500
    );
    return next(error);
  }

  user.branch = branch;
  user.username = username;
  user.email = email;
  user.password = password;

  try {
    await user.save();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not update user.',
      500
    );
    return next(error);
  }

  res.status(200).json({ user: user.toObject({ getters: true }) });
};



const deleteUserFromHqID = async (req, res, next) => {
  checkPermission(req.userData.username, next);

  const userId = req.params.uid;

  let user;
  let branch;
  try {
    branch = await Branch.find({users: { $all: [userId] } })
    user = await User.findById(userId).populate('hq')


  } catch (err) {
    const error = new HttpError(
      `Something went wrong, could not delete user. + ${err}`,
      500
    );
    return next(error);
  }

  if (!user) {
    const error = new HttpError('Could not find user for this id.', 404);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await user.remove({session: sess});

    user.hq.users.pull(user);
    branch[0].users.pull(user)

    await user.hq.save({session: sess});
    branch[0].save({session: sess})
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      `Something went wrong, could not delete user. + ${err}`,
      500
    );
    return next(error);
  }
  
  res.status(200).json({ message: 'Deleted user' });

};

exports.getUsersByHqID = getUsersByHqID;
exports.createUser = createUser ;
exports.login = login;
exports.updateUser  = updateUser ;
exports.deleteUserFromHqID = deleteUserFromHqID;