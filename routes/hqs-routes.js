const express = require('express');
const { check } = require('express-validator')
const hqsController = require('../controllers/hqs-controller');

const router = express.Router();

router.get('/', hqsController.getAllHQs);

router.get('/:hid', hqsController.getHQById);

router.post(
  '/',
  [
    check('_id')
      .not()
      .isEmpty(),
    check('name')
      .not()
      .isEmpty(),
    check('telephone')
      .isNumeric(),
    check('email')
      .isEmail()
  ],
  hqsController.createHQ
);

router.patch(
  '/:hid',
  [
    check('name')
      .not()
      .isEmpty(),
    check('telephone')
      .isNumeric(),
    check('email')
      .isEmail()
  ],
  hqsController.updateHQ
);

router.delete('/:hid', hqsController.deleteHQ);

module.exports = router;