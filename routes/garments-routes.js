// const express = require('express');
// const { check } = require('express-validator')
// const garmentsController = require('../controllers/garments-controller');

// const router = express.Router();

// router.get('/', garmentsController.getAllGarments);

// router.post(
//   '/',
//   [
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
//   garmentsController.createGarment
// );

// router.patch(
//   '/:gid',
//   [
//     check('id')
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
//   garmentsController.updateGarment
// );

// router.delete('/:gid', garmentsController.deleteGarment);


// router.get('/hq/:hqid', garmentsController.getGarmentsByHqID)

// router.post(
//   '/hq/:hqid/:gid',
//   [
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

// router.delete('/hq/:hqid/:gid', garmentsController.removeGarmentfromHqID);

