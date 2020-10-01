const express = require('express');
const { check } = require('express-validator')

const garmentsController = require('../controllers/garments-controller');
const fileUpload = require('../middleware/file-upload');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

router.use(checkAuth);

router.get('/', garmentsController.getAllGarments);

router.post(
  '/',
  fileUpload.single('image'),
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
  fileUpload.single('image'),
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
router.patch('/hq/:hqid', garmentsController.addGarmentsToHqID);
router.patch('/hq/:hqid/:gid', garmentsController.removeGarmentFromHqID);
router.get('/user/:uid', garmentsController.getGarmentsByUserID)


router.get('/hq/:hqid/available', garmentsController.getAvailableGarmentsByHqID)

module.exports = router;