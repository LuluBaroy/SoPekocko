const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
'use strict';

const userSchema = mongoose.Schema({
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true }
	/*birthdate: { type: Date, required: true },
	 *parentEmail: { type: String, required: true }  // if user is a child
	 *restricted: { type: Boolean, required: true },
	 *consents: {
	 * 	shareWithPartners: { type: Boolean, required: true },
	 * 	contactable: { type: Boolean, required: true}
	 * }
	 */
})

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);