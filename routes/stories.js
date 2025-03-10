const express = require('express')
const Razorpay = require('razorpay')
const router = express.Router()
const { ensureAuth } = require('../middlewear/auth')

const Story = require('../models/Story')
const Users = require('../models/Users')
const News = require('../models/News')
const Payment = require('../models/Payments')

let instance = new Razorpay({
	key_id: 'rzp_test_3OvTq6T7Wrlbki',
	key_secret: 'NsB6Ol6Kk6w9M6GyD4NYXGDD',
})

//description: show add page stuff
router.get('/add', ensureAuth, (req, res) => {
	res.render('stories/add')
})

//description: process add story form
router.post('/', ensureAuth, async (req, res) => {
	let errors = []
	try {
		let banStatus = req.user.ban
		console.log(banStatus)
		if (banStatus == 0) {
			req.body.user = req.user.id
			req.body.ban = 0
			req.body.likes = 0
			req.body.reports = 0
			await Story.create(req.body)

			res.redirect('/dashboard')
		} else {
			res.render('error/banned')
		}
	} catch (error) {
		console.error(error)
		res.render('error/500', { layout: 'errors' })
	}
})

//description: show all stories and news in page stuff
router.get('/', ensureAuth, async (req, res) => {
	try {
		var today = new Date()
		var date =
			today.getFullYear() +
			'-' +
			(today.getMonth() + 1) +
			'-' +
			today.getDate()

		const users = await Users.find({ usertype: 'user' }).lean()
		const news = await News.find({ createdAt: date }).lean()
		const stories = await Story.find({ status: 'public', ban: 0 })
			.sort({ likes: 'desc' })
			.populate('user')
			.sort({ createdAt: 'desc' })
			.lean()

		res.render('stories/index', { stories, users, news })
	} catch (error) {
		console.error(error)
		res.render('error/500', { layout: 'errors' })
	}
})

//description: show single story
router.get('/:id', ensureAuth, async (req, res) => {
	try {
		let story = await Story.findById(req.params.id).populate('user').lean()

		if (!story) {
			return res.render('error/404', { layout: 'errors' })
		}

		res.render('stories/show', {
			story,
		})
	} catch (err) {
		console.error(err)
		res.render('error/404', { layout: 'errors' })
	}
})

//description: update likes
router.get('/like/:id', ensureAuth, async (req, res) => {
	let story = await Story.findById(req.params.id).populate('user').lean()

	const userID = req.user.id

	let test = await Story.find(
		{
			_id: req.params.id,
			likedUsers: { $in: [userID] },
		},
		(err, response) => {
			if (err) {
				console.log(err)
			} else {
				if (response.length == 0) {
					Story.updateOne(
						{ _id: req.params.id },
						{ $push: { likedUsers: userID } },
						(err, response) => {
							if (err) {
								console.log(err)
							} else {
								Story.updateOne(
									{ _id: req.params.id },
									{ $inc: { likes: 1 } },
									(err, response) => {
										if (err) {
											console.log(err)
										} else {
											res.render('stories/show', {
												story,
											})
										}
									}
								)
							}
						}
					)
				} else {
					console.log('Already liked')
					res.render('stories/show', {
						story,
					})
				}
			}
		}
	)
})

//description: update report
router.get('/report/:id', ensureAuth, async (req, res) => {
	let story = await Story.findById(req.params.id).populate('user').lean()

	const userID = req.user.id

	let test = await Story.find(
		{
			_id: req.params.id,
			reportedUsers: { $in: [userID] },
		},
		(err, response) => {
			if (err) {
				console.log(err)
			} else {
				if (response.length == 0) {
					Story.updateOne(
						{ _id: req.params.id },
						{ $push: { reportedUsers: userID } },
						(err, response) => {
							if (err) {
								console.log(err)
							} else {
								Story.updateOne(
									{ _id: req.params.id },
									{ $inc: { reports: 1 } },
									(err, response) => {
										if (err) {
											console.log(err)
										} else {
											res.render('stories/show', {
												story,
											})
										}
									}
								)
							}
						}
					)
				} else {
					console.log('Already reported')
					res.render('stories/show', {
						story,
					})
				}
			}
		}
	)
})

//description: show edit page
router.get('/edit/:id', ensureAuth, async (req, res) => {
	const story = await Story.findOne({ _id: req.params.id }).lean()
	if (!story) {
		return res.render('error/404', { layout: 'errors' })
	}

	if (story.user != req.user.id) {
		res.redirect('/stories')
	} else {
		res.render('stories/edit', { story })
	}
})

//description: show payment page
router.get('/payment/:id', ensureAuth, async (req, res) => {
	let storyUserId = req.params.id
	let currentUser = req.user.id

	res.render('stories/donation', {
		paymentFor: storyUserId,
		layout: 'login',
	})
})
router.post('/donate', (req, res) => {
	let { to, name, email, phone, comment, amount } = req.body
	let currentUser = req.user.id
	amount = amount * 100

	var options = {
		amount: amount, // amount in the smallest currency unit
		currency: 'INR',
		receipt: name,
	}

	instance.orders
		.create(options)
		.then((data) => {
			res.render('stories/checkout', {
				data: data,
				body: req.body,
				layout: 'login',
			})
			// res.send({ data: data })
		})
		.catch((error) => {
			res.send({ sub: error, status: 'failed' })
		})
})
router.post('/checkout', async (req, res) => {
	let {
		name,
		email,
		order_id,
		amount,
		to,
		phone,
		comment,
		razorpay_payment_id,
	} = req.body

	let paymentobject = await Users.findOne({ _id: to }).lean()
	console.log(paymentobject)
	let donateToName = paymentobject.displayName
	let uid = req.user.id
	let serviceCharge = ((amount / 100) * 15) / 100
	const newRecord = new Payment({
		paymentId: razorpay_payment_id,
		donateTo: to,
		donateToName: donateToName,
		donationFrom: uid,
		email: email,
		amount: amount / 100,
		serviceCharge: serviceCharge,
	})
	newRecord
		.save()
		.then((stat) => {
			console.log(stat)
			res.redirect('/dashboard')
		})
		.catch((err) => {
			console.log(err)
		})
})

//description: update stories
router.put('/:id', ensureAuth, async (req, res) => {
	try {
		let story = await Story.findById(req.params.id).lean()

		if (!story) {
			return res.render('error/404', { layout: 'errors' })
		}

		if (story.user != req.user.id) {
			res.redirect('/stories')
		} else {
			story = await Story.findOneAndUpdate(
				{ _id: req.params.id },
				req.body,
				{
					new: true,
					runValidators: true,
				}
			)
			res.redirect('/dashboard')
		}
	} catch (err) {
		console.error(err)
		res.render('error/500', { layout: 'errors' })
	}
})

//description: delete story
router.delete('/:id', ensureAuth, async (req, res) => {
	try {
		await Story.remove({ _id: req.params.id })
		res.redirect('/dashboard')
	} catch (err) {
		console.error(err)
		res.render('error/500', { layout: 'errors' })
	}
})

//description: show particular user stories
router.get('/user/:userId', ensureAuth, async (req, res) => {
	try {
		const uname = await Users.find({ _id: req.params.userId })
			.populate('username')
			.lean()

		const stories = await Story.find({
			user: req.params.userId,
			status: 'public',
		})
			.populate('user')
			.lean()

		res.render('stories/userStories', {
			stories,
			uname,
		})
	} catch (err) {
		console.error(err)
		res.render('error/500', { layout: 'errors' })
	}
})

//description: admin ban story
router.get('/ban/:id', ensureAuth, async (req, res) => {
	try {
		await Story.find({ _id: req.params.id }, (err, response) => {
			if (err) {
				console.log(err)
			} else {
				Story.updateOne(
					{ _id: req.params.id },
					{ ban: 1 },
					(err, response) => {
						if (err) {
							console.log(err)
						} else {
							res.redirect('/adminallinfo')
						}
					}
				)
			}
		})
	} catch (err) {
		console.error(err)
		res.render('error/500', { layout: 'errors' })
	}
})

//description: admin unban story
router.get('/unban/:id', ensureAuth, async (req, res) => {
	try {
		await Story.find({ _id: req.params.id }, (err, response) => {
			if (err) {
				console.log(err)
			} else {
				Story.updateOne(
					{ _id: req.params.id },
					{ ban: 0 },
					(err, response) => {
						if (err) {
							console.log(err)
						} else {
							res.redirect('/adminallinfo')
						}
					}
				)
			}
		})
	} catch (err) {
		console.error(err)
		res.render('error/500', { layout: 'errors' })
	}
})

//description: admin delete story
router.get('/delete/:id', ensureAuth, async (req, res) => {
	try {
		await Story.deleteOne({ _id: req.params.id }, (err, response) => {
			if (err) {
				console.log(err)
			} else {
				res.redirect('/adminallinfo')
				/*
                Users.deleteOne(
                    {_id:req.params.id},
                    (err,response)=>{
                        if(err){
                            console.log(err)
                        }else{
                            res.redirect('/admindash')
                        }
                    })
                    */
			}
		})
	} catch (err) {
		console.error(err)
		res.render('error/500', { layout: 'errors' })
	}
})

module.exports = router
