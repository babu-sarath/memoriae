const mongoose = require('mongoose')

const UserScheme = new mongoose.Schema({
	userId: {
		type: String,
		required: true,
		index: true,
	},
	displayName: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		index: true, //28-09 testing unique stuff
	},
	password: {
		type: String,
	},
	image: {
		type: String,
	},
	usertype: {
		type: String,
	},
	ban: {
		type: Number,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
})

module.exports = mongoose.model('User', UserScheme)
