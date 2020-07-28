const User = require('../models/User');
const Report = require('../models/Reports');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {validationResult} = require('express-validator');
const sha1 = require('sha1');
const bouncer = require('express-bouncer')(0,0);
const fs = require('fs');
const logger = require('../middleware/winston')
'use strict';

/**
 * @api {post} /api/auth/signup Sign up
 * @apiName signup
 * @apiGroup User
 *
 * @apiParam {String} email (unique)
 * @apiParam {String} password (min 8 chars)
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
		logger.info('User tried to signup with invalid email and/or password');
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
			logger.info('New user has been created');
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
				logger.info("User can't be find in DB");
				return res.status(401).json({ error: 'User not found !' });
			}
			bouncer.reset(req);
			bcrypt.compare(req.body.password, user.password)
				.then(valid => {
					if (!valid) {
						logger.warn("User didn't use correct password");
						return res.status(401).json({ error: 'Wrong password !' });
					}
					bouncer.reset(req);
					logger.info('Registered user connected');
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

/**
* @api {get} /api/auth/:id Read
* @apiName readOne
* @apiGroup User
*
* @apiParam {String} ID userId
*
* @apiSuccess {String} userId
 * @apiSuccess {String} SHA1 user email
 * @apiSuccess {String} hash password
*
* @apiSuccessExample Success-Response:
*
*HTTP1.1/ 200 OK
*{
    "_id": "5f1ee7667a4701f8084c33f4",
    "email": "114605e63b127e2c37b0257a9d7601f018080ca5",
    "password": "$2a$10$iP6uQFCEnrPhZV75G4Q9C.nqg0ksEgRwmPft.aq4RMrGroNXUUbW2",
    "__v": 0
}
*
* @apiError Error
*
* @apiErrorExample {json} Error Response if user information can't be found
*HTTP1.1/  404 Not Found
*{
	*  "error": "Wrong password !"
	*}
*
*/
exports.readOne = (req, res, next) => {
	User.findOne({_id: req.params.id})
		.then((user) => {
			logger.info(`${req.params.id}: User asked for his information`)
			res.status(200).json(user)
		})
		.catch((error) => res.status(404).json({error: error}));

}

/**
 * @api {put} /api/auth/:id Update
 * @apiName update
 * @apiGroup User
 *
 * @apiParam {String} ID userId
 * @apiParam {String} Email OR Password OR Email AND Password - Each are possible
 *
 * @apiSuccess {String} message Message User modified
 *
 * @apiSuccessExample Success-Response:
 *
 *HTTP1.1/ 200 OK
 *{
    "message": "User modified !"
}
 *
 * @apiError Error
 *
 * @apiErrorExample {json} Error Response if user can't be authenticated
 *HTTP1.1/  400 Unauthorized
 *
 */
exports.update = (req, res, next) => {
	if(req.body.email){
		 const userModified = {
		...req.body.user,
			email: sha1(req.body.email)
		}
		User.updateOne({ _id: req.params.id }, { ...userModified, _id: req.params.id })
			.then(() => {
				logger.info(`${req.params.id}: User modified his email`)
				res.status(200).json({ message: 'User modified !'})
			})
			.catch(error => res.status(400).json({ error }));
	} else if(req.body.password){
		const password = req.body.password;
		bcrypt.hash(password, 10)
			.then(hash => {
				const userModified = {
					...req.body.user,
					password: hash
				}
				User.updateOne({ _id: req.params.id }, { ...userModified, _id: req.params.id })
					.then(() => {
						logger.info(`${req.params.id}: User modified his password`)
						res.status(200).json({ message: 'User modified !' })
					})
					.catch(error => res.status(400).json({ error }));
				})
			.catch(error => res.status(500).json({ error }))
	}
}

/**
 * @api {delete} /api/auth/:id Delete
 * @apiName delete
 * @apiGroup User
 *
 * @apiParam {String} ID userId
 *
 * @apiSuccess {String} message Message User deleted
 *
 * @apiSuccessExample Success-Response:
 *
 *HTTP1.1/ 200 OK
 *{
    "message": "User deleted !"
}
 *
 * @apiError Error
 *
 * @apiErrorExample {json} Error Response if user can't be authenticated
 *HTTP1.1/  400 Unauthorized
 *
 */
exports.delete = (req, res, next) => {
	User.deleteOne({ _id: req.params.id })
		.then(() => {
			logger.info(`${req.params.id}: User deleted his account`)
			res.status(200).json({ message: 'User deleted !'})
		})
		.catch(error => res.status(400).json({ error }));
}

/**
 * @api {post} /api/auth/:id/exports Export
 * @apiName export
 * @apiGroup User
 *
 * @apiParam {String} ID userId
 *
 * @apiSuccess {String} file Downloadable file containing user information
 *
 * @apiError Error
 *
 * @apiErrorExample {json} Error Response if user information can't be found
 *HTTP1.1/  404 Not Found
 *
 */
/*
* 	A REVOIR
*/
exports.export = (req, res, next) => {
	fs.stat('./files/userInfo.txt', (err) => {
		if(!err){
			fs.unlink('./files/userInfo.txt', err => {
				if(err){
					throw err;
				}
				console.log('File deleted !')
			})
		}
	})
	User.findOne({_id: req.params.id})
		.then(user => {
			fs.writeFile('./files/userInfo.txt', user, function(err){
				if(err){
					throw err;
				}
				console.log('File Created');
				res.setHeader('Content-type', 'text/plain');
				res.download('./files/userInfo.txt', (err) => {if(err){throw err}})
			})
			logger.info(`${req.params.id}: User asked for downloadable file containing his information`)
		})
		.catch((error) => res.status(404).json({error}));
}

/**
 * @api {put} /api/auth/:id Report
 * @apiName report
 * @apiGroup User
 *
 * @apiParam {String} ID userId
 * @apiParam {String} ItemId
 * @apiParam {String} type
 *
 * @apiSuccess {String} message Message New report has been created, our team will examinate it as soon as possible !
 *
 * @apiSuccessExample Success-Response:
 *
 *HTTP1.1/ 202 Accepted
 *{
    "message": "New report has been created, our team will examinate it as soon as possible !"
}
 *
 * @apiError Error
 *
 * @apiErrorExample {json} Error Response if itemId has alrealdy been reported
 *HTTP1.1/  401 Unauthorized
 * {
 *     "error": "A report has already been sent for this item !"
 * }
 *
 */
exports.report = (req, res, next) => {
	Report.findOne({itemId: req.body.itemId})
		.then(reports => {
			if(reports){
				logger.info(`${req.params.id}: User tried to send a report on an item already reported`)
				return res.status(401).json({ error: 'A report has already been sent for this item !' });
			}
			const report = new Report({
				itemId: `${req.body.itemId}`,
				type: `${req.body.type}`,
				userId: `${req.params.id}`,
				status: 'pending'
			})
			report.save()
				.then(() => {
					logger.warn(`${req.params.id}: User sent a new report about a ${req.body.type} in item ${req.body.itemId}`)
					res.status(202).json({ message: 'New report has been created, our team will examinate it as soon as possible !' })
				})
				.catch((err) => res.status(400).json({ err }))
		})
		.catch(err => res.status(400).json({ err }))
}