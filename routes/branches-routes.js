const express = require('express');
const { check } = require('express-validator')
const branchesController = require('../controllers/branches-controller');

const router = express.Router();

router.get('/:hid', branchesController.getBranchesByHqID);

router.post(
  '/:hid',
  [
    check('_id')
      .not()
      .isEmpty(),
    check('name')
      .not()
      .isEmpty(),
    check('telephone')
      .isNumeric(),
    check('address')
      .not()
      .isEmpty(),
    check('email')
      .isEmail()
  ],
  branchesController.createBranch
);

router.patch('/:hid/:bid',
  [
    check('_id')
      .not()
      .isEmpty(),
    check('name')
      .not()
      .isEmpty(),
    check('telephone')
      .isNumeric(),
    check('address')
      .not()
      .isEmpty(),
    check('email')
      .isEmail()
  ],
  branchesController.updateBranch
);

router.delete('/:hid/:bid', branchesController.deleteBranchFromHqID);

module.exports = router;