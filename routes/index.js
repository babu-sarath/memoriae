const express = require('express')
const router = express.Router()
const { ensureAuth, ensureGuest } = require('../middlewear/auth')
const Story = require('../models/Story')
const Users = require('../models/Users')
const Payment = require('../models/Payments')

//description: login/landing page
router.get('/', ensureGuest, (req, res) => {
	res.render('login', {
		layout: 'login-vector',
	})
})

//description: dashboard page
router.get('/dashboard', ensureAuth, async (req, res) => {
	try {
		const stories = await Story.find({ user: req.user.id }).lean()
		const payment = await Payment.find({ donationFrom: req.user.id }).lean()
		res.render('dashboard', {
			name: req.user.displayName,
			stories,
			payment,
		})
	} catch (err) {
		console.error(err)
		res.render('error/500', { layout: 'errors' })
	}
})

//description: admin dashboard page
router.get('/admindash', ensureAuth, async (req, res) => {
	try {
		let storyCount,
			usersCount,
			transactionCount,
			profit,
			grossIncome,
			mostReported,
			mostLiked
		await Story.estimatedDocumentCount(
			{ status: 'public' },
			(err, result) => {
				if (err) {
					console.log(err)
				} else {
					storyCount = result
				}
			}
		)
		await Users.estimatedDocumentCount(
			{ usertype: 'user' },
			(err, result) => {
				if (err) {
					console.log(err)
				} else {
					usersCount = result - 1
				}
			}
		)
		await Payment.estimatedDocumentCount(
			{ amount: { $ne: 0 } },
			(err, result) => {
				if (err) {
					console.log(err)
				} else {
					transactionCount = result
				}
			}
		)
		await Payment.find({ amount: { $ne: 0 } }, (err, result) => {
			if (err) {
				console.log(err)
			} else {
				value = result
				grossIncome = 0
				for (i = 0; i < value.length; i++)
					grossIncome += value[i].amount
			}
		})
		await Payment.find({ amount: { $ne: 0 } }, (err, result) => {
			if (err) {
				console.log(err)
			} else {
				value = result
				profit = 0
				for (i = 0; i < value.length; i++) {
					profit += parseFloat(value[i].serviceCharge)
				}
			}
		})
		let mostReportedDoc = await Story.find().sort({ reports: -1 }).limit(1)
		mostReported = mostReportedDoc[0]._id

		let mostLikedDoc = await Story.find().sort({ likes: -1 }).limit(1)
		mostLiked = mostLikedDoc[0]._id

		res.render('admindash', {
			layout: 'admin',
			storyCount,
			usersCount,
			transactionCount,
			grossIncome,
			profit,
			mostReported,
			mostLiked,
		})
	} catch (err) {
		console.error(err)
		res.render('error/500', { layout: 'errors' })
	}
})

router.get('/adminallinfo', ensureAuth, async (req, res) => {
	try {
		const stories = await Story.find({ status: 'public' }).lean()
		const users = await Users.find({ usertype: { $ne: 'admin' } }).lean()
		const payment = await Payment.find().lean()
		res.render('adminallinfo', {
			layout: 'admin',
			stories,
			users,
			payment,
			Payment,
		})
	} catch (err) {
		console.error(err)
		res.render('error/500', { layout: 'errors' })
	}
})

module.exports = router
