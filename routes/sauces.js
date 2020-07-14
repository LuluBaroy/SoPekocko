const express = require('express');
const router = express.Router();
const sauceCtrl = require('../controllers/sauces');

router.get('/:id', sauceCtrl.getOneSauce);

router.put('/:id', sauceCtrl.modifyOneSauce);

router.post('/', sauceCtrl.createSauce);

router.post('/:id/like', sauceCtrl.defineLikeStatus);

router.delete('/:id', sauceCtrl.deleteOneSauce);

router.get('/', sauceCtrl.getAllSauces);

module.exports = router;