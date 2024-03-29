const express = require('express');
const { check } = require('express-validator')

const usersController = require('../controllers/users-controller');

const router = express.Router();

router.post('/login', usersController.login);

router.post(
  '/:hid',
  [
    check('_id')
      .not()
      .isEmpty(),
    check('hq')
      .not()
      .isEmpty(),
    check('branch')
      .not()
      .isEmpty(),
    check('username')
      .not()
      .isEmpty(),
    check('email')
      .isEmail(),
    check('password')
      .not()
      .isEmpty(),
  ],
  usersController.createUser
);


router.get('/:hid', usersController.getUsersByHqID);


router.patch('/:hid/:uid',
  [
    check('_id')
      .not()
      .isEmpty(),
    check('hq')
      .not()
      .isEmpty(),
    check('branch')
      .not()
      .isEmpty(),
    check('username')
      .not()
      .isEmpty(),
    check('email')
      .isEmail(),
    check('password')
      .not()
      .isEmpty(),
  ],
  usersController.updateUser
);

router.delete('/:hid/:uid', usersController.deleteUserFromHqID);

module.exports = router;