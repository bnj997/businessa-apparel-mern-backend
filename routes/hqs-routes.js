const express = require('express');
const { check } = require('express-validator')

const hqsController = require('../controllers/hqs-controller');
const fileUpload = require('../middleware/file-upload');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

router.use(checkAuth);

router.get('/', hqsController.getAllHQs);

router.get('/:hid', hqsController.getHQById);

router.post(
  '/',
  fileUpload.single('image'),
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
  fileUpload.single('image'),
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
  hqsController.updateHQ
);

router.delete('/:hid', hqsController.deleteHQ);

module.exports = router;