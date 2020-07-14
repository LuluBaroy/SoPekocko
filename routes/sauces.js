const express = require('express');
const router = express.Router();
const Sauce = require('../models/Sauces');

router.get('/:id', (req, res, next) => {
	Sauce.findOne({ _id: req.params.id })
		.then(sauce => res.status(200).json(sauce))
		.catch(error => res.status(404).json({ error }));
})
router.put('/:id', (req, res, next) => {
	Sauce.updateOne({ _id: req.params.id }, { ...req.body, _id: req.params.id })
		.then(() => res.status(200).json({ message: 'Sauce modifiée !'}))
		.catch(error => res.status(400).json({ error }));
});

router.post('/', (req, res, next) => {
	delete req.body._id;
	const sauce = new Sauce({
		...req.body
	});
	sauce.save()
		.then(() => res.status(201).json({ message: 'Nouvelle sauce enregistrée !'}))
		.catch(error => res.status(400).json({ error }));
});

router.post('/:id/like', (req, res, next) => {
	res.status(200).json({ message: `Nombre de J'AIME pour la Sauce ${req.body.sauce} (ID n°${req.params.id}) modifié !`})
})

router.delete('/:id', (req, res, next) => {
	Sauce.deleteOne({ _id: req.params.id })
		.then(() => res.status(200).json({ message: 'Sauce supprimée !'}))
		.catch(error => res.status(400).json({ error }));
});

router.get('/', (req, res, next) => {
	Sauce.find()
		.then(sauces => res.status(200).json(sauces))
		.catch(error => res.status(400).json({error}));
})
module.exports = router;