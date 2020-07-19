const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {validationResult} = require('express-validator');
const sha1 = require('sha1');
const bouncer = require('express-bouncer')(0,0);
'use strict';

/**
 * @api {post} /api/auth/signup Sign up
 * @apiName signup
 * @apiGroup User
 *
 * @apiParam {String} user's email (unique)
 * @apiParam {String} user's password (min 8 chars)
 *
 * @apiSuccess {String} message Message of new user creation
 *
 * @apiSuccessExample Success-Response:
 *
 *HTTP1.1/ 201 Created
 *{
 *  "message": "New user has been created !"
 *}
 *
 * @apiError Error
 * @apiErrorExample {json} Error Response if user's trying to sign up with wrong parameters
 *
 *HTTP1.1/  422 Unprocessable Entity
 *{
 *  "errors":
 *  [
 *   {
 *	"value": "12345",
 *	"msg": "Email and / or password incorrect. Please try with a valid mail and / or password with at least 8 chars",
 *	"param": "password",
 *	"location": "body"
 *   }
 *  ]
 *}
 *
 */
exports.signup = (req, res, next) => {
	const errors = validationResult(req);
	if(!errors.isEmpty()){
		return res.status(422).json({ errors: errors.array() });
	}
	bcrypt.hash(req.body.password, 10)
		.then(hash => {
			const user = new User({
				email: sha1(req.body.email),
				password: hash
			});
			user.save()
				.then(() => res.status(201).json({ message: 'New user has been created' }))
				.catch(error => res.status(400).json({ error }));
		})
		.catch(error => res.status(500).json({ error }));
};

/**
 *	@api {post} /api/auth/login Log in
 * @apiName login
 * @apiGroup User
 *
 * @apiParam {String} email (unique)
 * @apiParam {String} password (min 8 chars)
 *
 * @apiSuccess {String} userId UserId generated by mongoose
 * @apiSuccess {String} token Token generated by JSONWebToken
 *
 * @apiSuccessExample Success-Response:
 *
 *HTTP1.1/ 200 OK
 *{
 *  "userId":"5f1233fbffe8d47d105b1463",
 *  "token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1ZjEyMzNmYmZmZThkNDdkMTA1YjE0NjMiLCJpYXQiOjE1OTUwNDAwMTUsImV4cCI6MTU5NTEyNjQxNX0.IBIGV-LNB8gp9gfT4HlJgUaRbvVOkiJTgvyvosAKiIk"
 *}
 *
 * @apiError Error
 *
 * @apiErrorExample {json} Error Response if user can't be authenticated
 *HTTP1.1/  401 Unauthorized
 *{
 *  "error": "Wrong password !"
 *}
 *
 */

exports.login = (req, res, next) => {
	User.findOne({ email: sha1(req.body.email) })
		.then(user => {
			if (!user) {
				return res.status(401).json({ error: 'User not found !' });
			}
			bouncer.reset(req);
			bcrypt.compare(req.body.password, user.password)
				.then(valid => {
					if (!valid) {
						return res.status(401).json({ error: 'Wrong password !' });
					}
					bouncer.reset(req);
					res.status(200).json({
						userId: user._id,
						token: jwt.sign(
							{ userId: user._id },
							'RANDOM_TOKEN_SECRET',
							{ expiresIn: '24h' }
						)
					});
				})
				.catch(error => res.status(500).json({ error }));
		})
		.catch(error => res.status(500).json({ error }));
};