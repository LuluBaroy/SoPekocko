const Sauces = require('../models/Sauces');
const fs = require('fs');
'use strict';

/**
 *	@api {post} /api/sauces Create
 * @apiName create
 * @apiGroup Sauces
 *
 * @apiParam {String} name Sauce name
 * @apiParam {String} manufacturer Sauce Manufacturer
 * @apiParam {String} description Sauce description
 * @apiParam {String} mainPepper Sauce main pepper
 * @apiParam {String} imageUrl Sauce image
 * @apiParam {Number} heat Sauce heat
 *
 * @apiSuccess {String} message Message for new sauce creating
 *
 * @apiSuccessExample Success-Response:
 *
 *HTTP1.1/ 201 Created
 *{
 *  "message":"Nouvelle Sauce enregistrée !"
 *}
 *
 * @apiError Error
 *
 *HTTP1.1/  400 Unauthorized
 *
 **/

exports.create = (req, res, next) => {
	const sauceCreated = JSON.parse(req.body.sauce);
	delete sauceCreated._id;
	sauceCreated.likes = 0;
	sauceCreated.dislikes = 0;
	sauceCreated.usersLiked = Array();
	sauceCreated.usersDisliked = Array();
	const sauce = new Sauces({
		...sauceCreated,
		imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
	});
	sauce.save()
		.then(() => res.status(201).json({ message: 'Nouvelle Sauce enregistrée !'}))
		.catch(error => res.status(400).json({ error }));
};

/**
 *	@api {get} /api/sauces/:id Read one
 * @apiName ReadOne
 * @apiGroup Sauces
 *
 * @apiParam {String} id sauce ID
 *
 * @apiSuccess {String} sauce JSON containing sauce informations
 *
 * @apiSuccessExample Success-Response:
 *
 *HTTP1.1/ 200 OK
 *{
 *  "usersLiked":[],
 *  "usersDisliked":[],
 *  "_id":"5f13520d1917be88d87faa0c",
 *  "name":"Harissa",
 *  "manufacturer":"Heinz",
 *  "description":"13",
 *  "mainPepper":"no idea",
 *  "heat":3,
 *  "userId":"5f1352021917be88d87faa0b",
 *  "likes":0,
 *  "dislikes":0,
 *  "imageUrl":"http://localhost:3000/images/2603250782.jpg",
 *  "__v":0
 *}
 *
 * @apiError Error
 *
 *HTTP1.1/  404 Not Found
 *
 **/
exports.readOne = (req, res, next) => {
	Sauces.findOne({_id: req.params.id})
		.then((sauce) => {res.status(200).json(sauce)})
		.catch((error) => {res.status(404).json({ error: error });
		}
	);
};

/**
 *	@api {post} /api/sauces/:id/like Like/Dislike
 * @apiName like
 * @apiGroup Sauces
 *
 * @apiParam {String} id sauce ID
 *
 * @apiSuccess {String} message Like or Dislike success message
 *
 * @apiSuccessExample Success-Response:
 *
 *HTTP1.1/ 200 OK
 *{
 * 'message': 'Like ajouté pour cette sauce !'
 *}
 *
 * @apiError Error
 *
 *HTTP1.1/  400 Unauthorized
 *
 **/
exports.like = (req, res, next) => {
	if(req.body.like === 1){
		Sauces.updateOne({_id: req.params.id}, {$inc: {likes: req.body.like++}, $push: {usersLiked: req.body.userId}})
			.then(() => res.status(200).json({ message: 'Like ajouté pour cette sauce !'}))
			.catch(error => res.status(400).json({ error }))
	} else if( req.body.like === -1){
		Sauces.updateOne({_id: req.params.id}, {$inc: {dislikes: (req.body.like++)*-1}, $push: {usersDisliked: req.body.userId}})
			.then(() => res.status(200).json({ message: 'Dislike ajouté pour cette sauce !'}))
			.catch(error => res.status(400).json({ error }))
	} else {
		Sauces.findOne({_id: req.params.id})
			.then(sauce => {
				if(sauce.usersLiked.includes(req.body.userId)){
					Sauces.updateOne({_id: req.params.id}, {$pull: {usersLiked: req.body.userId}, $inc: {likes: -1}})
						.then(() => res.status(200).json({ message: 'Votre Like a été retiré pour cette sauce'}))
						.catch(error => res.status(400).json({ error }))
				} else if(sauce.usersDisliked.includes(req.body.userId)){
					Sauces.updateOne({_id: req.params.id}, {$pull: {usersDisliked: req.body.userId}, $inc: {dislikes: -1}})
						.then(() => res.status(200).json({ message: 'Votre Dislike a été retiré pour cette sauce'}))
						.catch(error => res.status(400).json({ error }))
				}
			})
			.catch(error => res.status(400).json({ error }))
	}
}

/**
 *	@api {put} /api/sauces/:id Update
 * @apiName update
 * @apiGroup Sauces
 *
 * @apiParam {String} id sauce ID
 *
 * @apiSuccess {String} message Message Sauce modified
 *
 * @apiSuccessExample Success-Response:
 *
 *HTTP1.1/ 200 OK
 *{
 * message: 'Sauce modifiée !'
 *}
 *
 * @apiError Error
 *
 *HTTP1.1/  400 Unauthorized
 *
 **/
exports.update = (req, res, next) => {
	const sauceModified = req.file ?
		{
			...JSON.parse(req.body.sauce),
			imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
		} : { ...req.body };
	if(req.file){
		Sauces.findOne({_id: req.params.id})
			.then(sauce => {
				const filename = sauce.imageUrl.split('/images/')[1];
				fs.unlink(`images/${filename}`, (error) => {
					if( error ){
						console.log(error);
					}
				})
			})
			.catch(error => res.status(500).json({ error }))
	}
	Sauces.updateOne({ _id: req.params.id }, { ...sauceModified, _id: req.params.id })
		.then(() => res.status(200).json({ message: 'Sauce modifiée !'}))
		.catch(error => res.status(400).json({ error }));
};

/**
 *	@api {delete} /api/sauces/:id Delete
 * @apiName delete
 * @apiGroup Sauces
 *
 * @apiParam {String} id sauce ID
 *
 * @apiSuccess {String} message Message Sauce deleted
 *
 * @apiSuccessExample Success-Response:
 *
 *HTTP1.1/ 200 OK
 *{
 * message: 'Sauce supprimée !'
 *}
 *
 * @apiError Error
 *
 *HTTP1.1/  400 Unauthorized
 *
 **/
exports.delete = (req, res, next) => {
	Sauces.findOne({ _id: req.params.id})
		.then(sauce => {
			const filename = sauce.imageUrl.split('/images/')[1];
			fs.unlink(`images/${filename}`, () => {
				Sauces.deleteOne({ _id: req.params.id })
					.then(() => res.status(200).json({ message: 'Sauce supprimée !'}))
					.catch(error => res.status(400).json({ error }));
			})
		})
		.catch(error => res.status(400).json({ error }));
};

/**
 *	@api {get} /api/sauces Read all
 * @apiName readAll
 * @apiGroup Sauces
 *
 * @apiSuccess {String} sauces JSON containing all sauces
 *
 * @apiSuccessExample Success-Response:
 *
 *HTTP1.1/ 200 OK
 *
 * [
    {
        "usersLiked": [],
        "usersDisliked": [
            "5f1352021917be88d87faa0b"
        ],
        "_id": "5f135b41f186be8dc4c5fa7f",
        "name": "Harissa",
        "manufacturer": "Heinz",
        "description": "123",
        "mainPepper": "no idea",
        "heat": 3,
        "userId": "5f1352021917be88d87faa0b",
        "likes": 0,
        "dislikes": 1,
        "imageUrl": "http://localhost:3000/images/3982395801.jpg",
        "__v": 0
    }
]
 *
 * @apiError Error
 *
 *HTTP1.1/  400 Unauthorized
 *
 **/
exports.readAll = (req, res, next) => {
	Sauces.find()
		.then(sauces => res.status(200).json(sauces))
		.catch(error => res.status(400).json({error}));
}