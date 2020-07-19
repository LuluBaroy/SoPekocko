const {body} = require('express-validator');

'use strict';
const message = "Email and / or password incorrect. Please try with a valid mail and / or password with at least 8 chars";
exports.checkingSignup = [
	body('email').isEmail().withMessage(message),
	body('password').isLength({min: 8}).withMessage(message)
]