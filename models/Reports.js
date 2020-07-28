const mongoose = require('mongoose');

const reportSchema = mongoose.Schema({
	itemId: { type: String, required: true },
	type: { type: String, required: true },
	userId: { type: String, required: true },
	status: { type: String, required: true }
})

module.exports = mongoose.model('Report', reportSchema);

