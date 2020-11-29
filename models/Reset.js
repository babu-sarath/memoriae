const mongoose = require('mongoose')

const ResetScheme = new mongoose.Schema({
	email: {
		type: String,
		index: true, //28-09 testing unique stuff
	},
	key: {
		type: String,
	},
	status: {
		type: String,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
})

module.exports = mongoose.model('Reset', ResetScheme)
