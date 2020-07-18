const express = require('express');
const router = express.Router();
const validator = require('../middleware/validator');
const userCtrl = require('../controllers/users');
const bouncer = require('express-bouncer')(15000, 30000, 3);
'use strict';

router.post('/signup', validator.checkingSignup, userCtrl.signup);

router.post('/login', bouncer.block, userCtrl.login);

module.exports = router;