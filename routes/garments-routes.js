const express = require('express');
const { check } = require('express-validator')
const garmentsController = require('../controllers/garments-controller');

const router = express.Router();

router.get('/', garmentsController.getAllGarments);

router.post(
  '/',
  [
    check('_id')
      .not()
      .isEmpty(),
    check('styleNum')
      .not()
      .isEmpty(),
    check('name')
      .not()
      .isEmpty(),
    check('price')
      .isNumeric(),
    check('category')
      .not()
      .isEmpty(),
    check('supplier')
      .not()
      .isEmpty(),
    check('description')
      .not()
      .isEmpty(),
    check('colours')
      .not()
      .isEmpty(),
    check('sizes')
      .not()
      .isEmpty(),
  ],
  garmentsController.createGarment
);

router.patch(
  '/:gid',
  [
    check('_id')
      .not()
      .isEmpty(),
    check('styleNum')
      .not()
      .isEmpty(),
    check('name')
      .not()
      .isEmpty(),
    check('price')
      .isNumeric(),
    check('category')
      .not()
      .isEmpty(),
    check('supplier')
      .not()
      .isEmpty(),
    check('description')
      .not()
      .isEmpty(),
    check('colours')
      .not()
      .isEmpty(),
    check('sizes')
      .not()
      .isEmpty(),
  ],
  garmentsController.updateGarment
);

router.delete('/:gid', garmentsController.deleteGarment);


router.get('/hq/:hqid', garmentsController.getGarmentsByHqID)

// router.post(
//   '/hq/:hqid/:gid',
//   [
//     check('_id')
//       .not()
//       .isEmpty(),
//     check('styleNum')
//       .not()
//       .isEmpty(),
//     check('name')
//       .not()
//       .isEmpty(),
//     check('price')
//       .isNumeric(),
//     check('supplier')
//       .not()
//       .isEmpty(),
//     check('description')
//       .not()
//       .isEmpty(),
//     check('colors')
//       .not()
//       .isEmpty(),
//     check('sizes')
//       .not()
//       .isEmpty(),
//   ],
//   garmentsController.addGarmentToHqID
// );

// router.delete('/:hqid/:gid', garmentsController.removeGarmentfromHqID);

module.exports = router;