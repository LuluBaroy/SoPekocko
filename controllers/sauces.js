const Sauces = require('../models/Sauces');
const fs = require('fs');

exports.createSauce = (req, res, next) => {
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

exports.getOneSauce = (req, res, next) => {
	Sauces.findOne({_id: req.params.id})
		.then((sauce) => {res.status(200).json(sauce)})
		.catch((error) => {res.status(404).json({ error: error });
		}
	);
};

exports.defineLikeStatus = (req, res, next) => {
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

exports.modifyOneSauce = (req, res, next) => {
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
						console.log("Error : Deleting failed !");
					}
				})
			})
			.catch(error => res.status(500).json({ error }))
	}
	Sauces.updateOne({ _id: req.params.id }, { ...sauceModified, _id: req.params.id })
		.then(() => res.status(200).json({ message: 'Sauce modifiée !'}))
		.catch(error => res.status(400).json({ error }));
};

exports.deleteOneSauce = (req, res, next) => {
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

exports.getAllSauces = (req, res, next) => {
	Sauces.find()
		.then(sauces => res.status(200).json(sauces))
		.catch(error => res.status(400).json({error}));
}