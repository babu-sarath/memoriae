const mongoose = require('mongoose')

const PaymentScheme = new mongoose.Schema({
	paymentId: {
		type: String,
		required: true,
		index: true,
	},
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
	},
	paymentAt: {
		type: Date,
		default: Date.now,
	},
	amount: {
		type: Number,
	},
	serviceCharge: {
		type: mongoose.Decimal128,
	},
})

module.exports = mongoose.model('Payments', PaymentScheme)
