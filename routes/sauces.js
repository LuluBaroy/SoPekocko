const express = require('express');
const router = express.Router();
const sauceCtrl = require('../controllers/sauces');
const auth = require('../middleware/auth');

router.get('/:id', auth,  sauceCtrl.getOneSauce);

router.put('/:id', auth, sauceCtrl.modifyOneSauce);

router.post('/', auth, sauceCtrl.createSauce);

router.post('/:id/like', auth, sauceCtrl.defineLikeStatus);

router.delete('/:id', auth, sauceCtrl.deleteOneSauce);

router.get('/', auth, sauceCtrl.getAllSauces);

module.exports = router;