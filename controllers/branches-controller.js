const { v4: uuidv4 } = require('uuid');
const { validationResult, check } = require('express-validator');
const mongoose = require('mongoose');
const HttpError = require('../models/http-error');
const checkPermission = require('../utils/check-permission');

const Branch = require('../models/branch');
const HQ = require('../models/hq');
const User = require('../models/user');

const createBranch = async (req, res, next) => {
  checkPermission(req.userData.username, next);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError(`Creating Branch Failed. Invalid inputs passed, please check your data.`, 422)
    );
  }
  
  const { _id, name, telephone, address, email, hq} = req.body;
  const createdBranch = new Branch({
    _id,
    name,
    telephone,
    address,
    email,
    hq, 
    users: []
  });

  let hqMain;
  try {
    hqMain = await HQ.findById(hq);
  } catch (err) {
    const error = new HttpError(
      'Creating branch failed, please try again.',
      500
    );
    return next(error);
  }

  if (!hqMain) {
    const error = new HttpError('Could not find branch for provided id.', 404);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdBranch.save(); 
    hqMain.branches.push(createdBranch)
    await hqMain.save({session: sess })
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      'Creating Branch failed, please try again.',
      500
    );
    return next(error);
  }
  res.status(201).json({ branch: createdBranch.toObject({ getters: true }) });
};



const getBranchesByHqID = async (req, res, next) => {
  checkPermission(req.userData.username, next);

  const hqID = req.params.hid
  let hqWithBranches;

  try {
    hqWithBranches = await HQ.findById(hqID).populate('branches');
  } catch (err) {
    const error = new HttpError(
      `Fetching branches failed, try again later. + ${err} `,
      500
    );
    return next(error);
  }

  res.json({ branches: hqWithBranches.branches.map(branch => branch.toObject({ getters: true })) });
};

const getBranchByUserID = async (req, res, next) => {

  const userID = req.params.uid

  try {
    userBranch = await User.findById(userID).populate('branch').populate('hq');
  } catch (err) {
    const error = new HttpError(
      `Fetching branch for user failed, try again later. + ${err} `,
      500
    );
    return next(error);
  }

  res.json({ userBranch: userBranch.toObject({ getters: true }) });
};



const updateBranch = async (req, res, next) => {
  checkPermission(req.userData.username, next);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError(`Invalid inputsssss passed, please check your data`, 422)
    );
  }

  const {name, telephone, address, email} = req.body;
  const branchId = req.params.bid;

  let branch;
  try {
    branch = await Branch.findById(branchId);
  } catch (err) {
    const error = new HttpError(
      `Something went wrong, could not update  branch.` ,
      500
    );
    return next(error);
  }

  branch.name = name;
  branch.telephone = telephone;
  branch.address = address;
  branch.email = email ;

  try {
    await branch.save();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not update branch.',
      500
    );
    return next(error);
  }

  res.status(200).json({ branch: branch.toObject({ getters: true }) });
};



const deleteBranchFromHqID = async (req, res, next) => {
  checkPermission(req.userData.username, next);

  const branchId = req.params.bid;

  let branch;
  let branchName;
  try {
    branch = await Branch.findById(branchId).populate('hq');
    branchID =  branch._id;
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete branch.',
      500
    );
    return next(error);
  }

  if (!branch) {
    const error = new HttpError('Could not find branch for this id.', 404);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await branch.remove({session: sess});
    branch.hq.branches.pull(branch);


    await User.deleteMany({branch: branchID})

    await branch.hq.save({session: sess});
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete branch.',
      500
    );
    return next(error);
  }
  
  res.status(200).json({ message: 'Deleted branch.' });

};

exports.getBranchesByHqID = getBranchesByHqID;
exports.getBranchByUserID = getBranchByUserID;
exports.createBranch = createBranch;
exports.updateBranch = updateBranch;
exports.deleteBranchFromHqID = deleteBranchFromHqID;