const {body} = require('express-validator');
'use strict';
const message = "Email et / ou mot de passe incorrect. Merci de renseigner un mail valide et / ou un mot de passe d'au moins 8 caractères";
exports.checkingSignup = [
	body('email').isEmail().withMessage(message),
	body('password').isLength({min: 8}).withMessage(message)
]