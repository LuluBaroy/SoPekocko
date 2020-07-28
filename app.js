require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { expressShield } = require('node-shield');
const helmet = require('helmet');
const cors = require('cors');
const sauceRoutes = require('./routes/sauces');
const userRoutes = require('./routes/users');
const path = require('path');

mongoose.connect(`mongodb+srv://${process.env.ID}:${process.env.MDP}@${process.env.CLUSTER}.frf0n.mongodb.net/${process.env.COLLEC}?retryWrites=true&w=majority`,
	{ useNewUrlParser: true,
	useUnifiedTopology: true })
	.then(() => console.log('Connexion à MongoDB réussie !'))
	.catch(() => console.log('Connexion à MongoDB échouée !'));

app.use(helmet());
app.use(cors());
app.use(bodyParser.json());

app.use(expressShield({
	errorHandler: (shieldError, req, res, next) => {
		console.error(shieldError);
		res.sendStatus(400);
	}
}));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/files', express.static(path.join(__dirname, 'files')));
app.use('/api/sauces', sauceRoutes);
app.use('/api/auth', userRoutes);

module.exports = app;