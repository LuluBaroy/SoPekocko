const Sauces = require('../models/Sauces');

exports.createSauce = (req, res, next) => {
	const sauce = new Sauces({
		...req.body
	});
	sauce.save().then(
		() => {
			res.status(201).json({
				message: 'Nouvelle Sauce créée !'
			});
		}
	).catch(
		(error) => {
			res.status(400).json({
				error: error
			});
		}
	);
};

exports.getOneSauce = (req, res, next) => {
	Sauces.findOne({
		_id: req.params.id
	}).then(
		(sauce) => {
			res.status(200).json(sauce);
		}
	).catch(
		(error) => {
			res.status(404).json({
				error: error
			});
		}
	);
};

exports.defineLikeStatus = (req, res, next) => {
	res.status(200).json({ message: `Nombre de J'AIME pour la Sauce ${req.body.sauce} (ID n°${req.params.id}) modifié !`})
}

exports.modifyOneSauce = (req, res, next) => {
	Sauces.updateOne({ _id: req.params.id }, { ...req.body, _id: req.params.id })
		.then(() => res.status(200).json({ message: 'Sauce modifiée !'}))
		.catch(error => res.status(400).json({ error }));
};

exports.deleteOneSauce = (req, res, next) => {
	Sauces.deleteOne({ _id: req.params.id })
		.then(() => res.status(200).json({ message: 'Sauce supprimée !'}))
		.catch(error => res.status(400).json({ error }));
};

exports.getAllSauces = (req, res, next) => {
	Sauces.find()
		.then(sauces => res.status(200).json(sauces))
		.catch(error => res.status(400).json({error}));
}