const {body} = require('express-validator');

exports.checkingSignup = [
	body('email').isEmail().withMessage('Merci de renseigner une adresse mail valide'),
	body('password').isLength({min: 5}).withMessage('Minimum 5 caractères')
]