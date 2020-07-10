const express = require('express');
const router = express.Router();

router.get('/:id', (req, res, next) => {
	res.status(200).json({ sauce: `Sauce ${req.params.id}`})
})

router.post('/', (req, res, next) => {
	console.log(req.body);
	res.status(201).json({ message: 'Nouvelle sauce créée !'});
})

router.post('/:id/like', (req, res, next) => {
	res.status(200).json({ message: `Nombre de J'AIME pour la Sauce ${req.body.sauce} (ID n°${req.params.id}) modifié !`})
})

router.get('/', (req, res, next) => {
	res.status(200).json([ 'message: Sauces trouvées']);
})
module.exports = router;