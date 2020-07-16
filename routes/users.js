const express = require('express');
const router = express.Router();

const userCtrl = require('../controllers/users');
const bouncer = require('express-bouncer')(15000, 60000, 2);

router.post('/signup', userCtrl.signup);
router.post('/login', bouncer.block, userCtrl.login);

module.exports = router;