const express = require('express');
const router = express.Router();
const validator = require('../middleware/validator');
const userCtrl = require('../controllers/users');
const bouncer = require('express-bouncer')(15000, 30000, 3);
const auth = require('../middleware/auth');
'use strict';

router.post('/signup', validator.checkingSignup, userCtrl.signup);

router.post('/login', bouncer.block, userCtrl.login);

router.get('/:id', auth, userCtrl.readOne);

router.put('/:id', auth, userCtrl.update);

router.put('/:id/reports', auth, userCtrl.report);

router.delete('/:id', auth, userCtrl.delete);

router.post('/:id/exports', auth, userCtrl.export);
module.exports = router;