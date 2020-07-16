const express = require('express');
const router = express.Router();
const sauceCtrl = require('../controllers/sauces');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

router.get('/:id', auth,  sauceCtrl.getOneSauce);

router.put('/:id', auth, multer, sauceCtrl.modifyOneSauce);

router.post('/', auth, multer, sauceCtrl.createSauce);

router.post('/:id/like', auth, sauceCtrl.defineLikeStatus);

router.delete('/:id', auth, multer, sauceCtrl.deleteOneSauce);

router.get('/', auth, sauceCtrl.getAllSauces);

module.exports = router;