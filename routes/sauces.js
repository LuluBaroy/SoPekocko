const express = require('express');
const router = express.Router();
const sauceCtrl = require('../controllers/sauces');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const log = require('../middleware/winston');
'use strict';

router.get('/:id', auth,  sauceCtrl.readOne);

router.put('/:id', auth, multer, sauceCtrl.update);

router.post('/', auth, multer, sauceCtrl.create);

router.post('/:id/like', auth, sauceCtrl.like);

router.delete('/:id', auth, multer, sauceCtrl.delete);

router.get('/', auth, sauceCtrl.readAll);

module.exports = router;