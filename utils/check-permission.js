const HttpError = require("../models/http-error");

const checkPermission = async (username, next) => {
  if (username !== "adminstaff") {
    const error = new HttpError("Unauthorised action.", 401);
    return next(error);
  }
};

module.exports = checkPermission;
