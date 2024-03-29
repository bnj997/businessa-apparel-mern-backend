const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const HttpError = require("../models/http-error");
const checkPermission = require("../utils/check-permission");

const Garment = require("../models/garment");
const HQ = require("../models/hq");
const User = require("../models/user");

const aws = require("aws-sdk");
aws.config.update({
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  accessKeyId: process.env.ACCESS_KEY_ID,
  region: process.env.REGION,
});
const s3 = new aws.S3();

const getAllGarments = async (req, res, next) => {
  checkPermission(req.userData.username, next);

  let garments;
  try {
    garments = await Garment.find();
  } catch (err) {
    const error = new HttpError(
      "Fetching Garments failed, please try again later.",
      500
    );
    return next(error);
  }
  res.json({
    garments: garments.map((garment) => garment.toObject({ getters: true })),
  });
};

const getGarmentsByHqID = async (req, res, next) => {
  checkPermission(req.userData.username, next);

  const hqID = req.params.hqid;
  let hqWithGarments;

  try {
    hqWithGarments = await HQ.findById(hqID).populate("garments");
  } catch (err) {
    const error = new HttpError(
      `Fetching garments failed, try again later. + ${err} `,
      500
    );
    return next(error);
  }

  res.json({
    garments: hqWithGarments.garments.map((garment) =>
      garment.toObject({ getters: true })
    ),
  });
};

const getGarmentsByUserID = async (req, res, next) => {
  const userID = req.userData.userId;
  let usersHQ;

  try {
    usersHQ = await User.findById(userID).populate("hq");
    hqWithGarments = await HQ.findById(usersHQ.hq._id).populate("garments");
  } catch (err) {
    const error = new HttpError(
      `Could not get garments for given user. + ${err} `,
      500
    );
    return next(error);
  }

  if (!hqWithGarments || hqWithGarments.garments.length === 0) {
    return next(
      new HttpError("Could not find garments for the provided HQ id.", 404)
    );
  }

  res.json({
    garments: hqWithGarments.garments.map((garment) =>
      garment.toObject({ getters: true })
    ),
  });
};

const getAvailableGarmentsByHqID = async (req, res, next) => {
  checkPermission(req.userData.username, next);

  const hqID = req.params.hqid;
  let garmentsAvailableForHQ;

  try {
    // Fetch the HQ by its ID
    const hq = await HQ.findById(hqID);
    if (!hq) {
      const error = new HttpError("HQ not found", 404);
      return next(error);
    }

    // Get the garments that are already in this HQ
    const garmentsInHQ = hq.garments;

    // Find all garments that are not in the garmentsInHQ array
    garmentsAvailableForHQ = await Garment.find({
      _id: { $nin: garmentsInHQ },
    });
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      `Fetching available garments failed, try again later. + ${err} `,
      500
    );
    return next(error);
  }

  res.json({
    garments: garmentsAvailableForHQ.map((garment) =>
      garment.toObject({ getters: true })
    ),
  });
};

const createGarment = async (req, res, next) => {
  checkPermission(req.userData.username, next);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError(
        `Creating Garment Failed. Invalid inputs passed, please check your data.`,
        422
      )
    );
  }
  const {
    _id,
    styleNum,
    name,
    price,
    category,
    supplier,
    description,
    colours,
    sizes,
  } = req.body;
  const createdGarment = new Garment({
    _id,
    image: req.file.transforms[0].location,
    styleNum,
    name,
    price,
    category,
    supplier,
    description,
    colours,
    sizes,
    hqs: [],
  });
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();

    await createdGarment.save();
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      `Creating Garment failed, please try again. + ${err} `,
      500
    );
    return next(error);
  }
  res.status(201).json({ garment: createdGarment.toObject({ getters: true }) });
};

const addGarmentsToHqID = async (req, res, next) => {
  checkPermission(req.userData.username, next);

  const hqID = req.params.hqid;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }
  let hqOfInterest;
  let garment;
  hqOfInterest = await HQ.findById(hqID);

  for (var i = 0; i < req.body.garments.length; i++) {
    try {
      garment = await Garment.findById(req.body.garments[i]._id);
    } catch (err) {
      const error = new HttpError(
        `Finding garment to be addedfailed, try again later.`,
        500
      );
      return next(error);
    }
    try {
      const sess = await mongoose.startSession();
      sess.startTransaction();
      hqOfInterest.garments.push(req.body.garments[i]._id);
      garment.hqs.push(hqOfInterest);
      await hqOfInterest.save({ session: sess });
      await garment.save({ session: sess });
      await sess.commitTransaction();
    } catch (err) {
      const error = new HttpError(
        `Something went wrong, could not update HQ. + ${err} `,
        500
      );
      return next(error);
    }
  }

  res
    .status(200)
    .json({ hqOfInterest: hqOfInterest.toObject({ getters: true }) });
};

const updateGarment = async (req, res, next) => {
  checkPermission(req.userData.username, next);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const {
    styleNum,
    name,
    price,
    category,
    supplier,
    description,
    colours,
    sizes,
  } = req.body;
  const garmentID = req.params.gid;

  let garment;
  try {
    garment = await Garment.findById(garmentID);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update Garment.",
      500
    );
    return next(error);
  }

  if (req.file !== undefined) {
    const imageLocation = garment.image.replace(
      "https://business-apparel.s3.ap-southeast-2.amazonaws.com/",
      ""
    );
    var params = {
      Bucket: "business-apparel",
      Key: imageLocation,
    };
    s3.deleteObject(params, function (err, data) {
      if (err) console.log(err, err.stack); // an error occurred
      else console.log(data); // successful response
    });
    garment.image = req.file.transforms[0].location;
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
      "Something went wrong, could not update Garment.",
      500
    );
    return next(error);
  }

  res.status(200).json({ garment: garment.toObject({ getters: true }) });
};

const deleteGarment = async (req, res, next) => {
  checkPermission(req.userData.username, next);

  const garmentID = req.params.gid;

  let garment;
  let hqsToRemoveGarmentFrom;
  try {
    garment = await Garment.findById(garmentID);
    hqsToRemoveGarmentFrom = await HQ.find({ garments: { $all: [garmentID] } });
  } catch (err) {
    const error = new HttpError(
      `Something went wrong, could not delete garment`,
      500
    );
    return next(error);
  }

  if (!garment) {
    const error = new HttpError("Could not find garment for this id.", 404);
    return next(error);
  }

  const imageLocation = garment.image.replace(
    "https://business-apparel.s3.ap-southeast-2.amazonaws.com/",
    ""
  );

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await garment.remove({ session: sess });

    for (var i = 0; i < hqsToRemoveGarmentFrom.length; i++) {
      var index = hqsToRemoveGarmentFrom[i].garments.indexOf(garmentID);
      hqsToRemoveGarmentFrom[i].garments.splice(index, 1);
      await hqsToRemoveGarmentFrom[i].save({ session: sess });
    }
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete garment.",
      500
    );
    return next(error);
  }

  var params = {
    Bucket: "business-apparel",
    Key: imageLocation,
  };
  s3.deleteObject(params, function (err, data) {
    if (err) console.log(err, err.stack); // an error occurred
  });

  res.status(200).json({ message: "Deleted garment." });
};

const removeGarmentFromHqID = async (req, res, next) => {
  checkPermission(req.userData.username, next);

  const garmentID = req.params.gid;
  const hqID = req.params.hqid;

  let hqToRemoveGarmentFrom;
  let garmentToBeRemoveFromHQ;
  try {
    hqToRemoveGarmentFrom = await HQ.find({
      $and: [{ _id: [hqID] }, { garments: { $all: [garmentID] } }],
    });
    garmentToBeRemoveFromHQ = await Garment.find({
      $and: [{ _id: [garmentID] }, { hqs: { $all: [hqID] } }],
    });
  } catch (err) {
    const error = new HttpError(
      `Something went wrong1, could not delete garment from HQ. + ${err}`,
      500
    );
    return next(error);
  }

  if (!hqToRemoveGarmentFrom[0]) {
    const error = new HttpError(
      "Could not find garment for this id to remove from this HQ.",
      404
    );
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();

    var index1 = hqToRemoveGarmentFrom[0].garments.indexOf(garmentID);
    hqToRemoveGarmentFrom[0].garments.splice(index1, 1);
    var index2 = garmentToBeRemoveFromHQ[0].hqs.indexOf(hqID);
    garmentToBeRemoveFromHQ[0].hqs.splice(index2, 1);

    await hqToRemoveGarmentFrom[0].save({ session: sess });
    await garmentToBeRemoveFromHQ[0].save({ session: sess });

    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      `Something went wrong2, could not delete garment from HQ. + ${err}`,
      500
    );
    return next(error);
  }

  res.status(200).json({ message: "Deleted garment." });
};

exports.getAllGarments = getAllGarments;
exports.getGarmentsByHqID = getGarmentsByHqID;
exports.getGarmentsByUserID = getGarmentsByUserID;
exports.getAvailableGarmentsByHqID = getAvailableGarmentsByHqID;
exports.createGarment = createGarment;
exports.addGarmentsToHqID = addGarmentsToHqID;
exports.updateGarment = updateGarment;
exports.deleteGarment = deleteGarment;
exports.removeGarmentFromHqID = removeGarmentFromHqID;
