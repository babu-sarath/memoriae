const express = require('express')
const passport = require('passport')
const bcrypt = require('bcrypt')

const Story = require('../models/Story')
const Users = require('../models/Users')
const Reset = require('../models/Reset')

const { ensureAuth } = require('../middlewear/auth')
const router = express.Router()

//description: oldschool register page show
router.get('/register', (req, res) => {
	res.render('register', { layout: 'register-vector' })
})

//description: admin login page show
router.get('/admin', (req, res) => {
	res.render('admin', { layout: 'login' })
})

//description: oldschool register request
router.post('/register', (req, res) => {
	let usertype = 'user'
	let ban = 0
	let { name, email, password, password2, image } = req.body
	// let errors = []
	let errors = ''
	const saltRounds = 10

	//check passowrds match
	if (password != password2) {
		// errors.push({
		// 	msg: 'The passwords entered do no match! Please try again.',
		// })
		errors = 'The passwords entered do no match! Please try again.'
	}
	//check password length
	if (password.length < 6) {
		// errors.push({
		// 	msg:
		// 		'The length of the Password should be at least six characters long! Please try again.',
		// })
		errors =
			'The length of the Password should be at least six characters long! Please try again.'
	}
	if (image == '') {
		image =
			'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcS-16y4LKaxCJWkLi3x8tXLnTLnwKZfkE2l-g&usqp=CAU'
	}
	if (errors) {
		// res.render('error/generalErrors', {
		// 	layout: 'errors',
		// 	errors: errors[0],
		// })
		res.render('register', {
			message: errors,
			messageClass: 'alert-danger alert-dismissible fade show',
			layout: 'register-vector',
		})
	} else {
		let uid = Math.floor(
			100000000000000000000 + Math.random() * 999999999999999999999
		)
		const newUser = new Users({
			userId: uid,
			displayName: name,
			email: email,
			password: bcrypt.hashSync(password2, saltRounds),
			image: image,
			usertype: usertype,
			ban: ban,
		})

		newUser
			.save()
			.then((user) => {
				res.render('login', {
					message:
						'You have been successfully registered. Login with the credentials you have created.',
					messageClass: 'alert-success alert-dismissible fade show',
					layout: 'login-vector',
				})
				console.log(user)
			})
			.catch((err) => {
				res.render('register', {
					message:
						'The email is already registered with Memoriae. If you forgot the password, try the forgot password option.',
					messageClass: 'alert-danger alert-dismissible fade show',
					layout: 'register-vector',
				})
				console.log(err)
			})
	}
})

//description: login error handle
router.get('/loginerror', (req, res) => {
	// res.render('error/loginProblem', { layout: 'login' })
	res.render('login', {
		message:
			'Invalid credentials entered. Please check your email and password and try again',
		messageClass: 'alert-danger alert-dismissible fade show',
		layout: 'login-vector',
	})
})

//login handle
router.post('/login', (req, res, next) => {
	passport.authenticate('local', {
		successRedirect: '/stories',
		failureRedirect: '/users/loginerror',
	})(req, res, next)
})

//adminlogin handle
router.post('/adminlogin', (req, res, next) => {
	let inputEmail = req.body.email

	Users.findOne({ email: inputEmail, usertype: 'admin' }).then((user) => {
		if (user) {
			passport.authenticate('local', {
				successRedirect: '/admindash',
				failureRedirect: '/users/loginerror',
			})(req, res, next)
		} else {
			res.render('admin', { layout: 'login' })
		}
	})
})

//reset passoword handle
router.get('/passwordReset/:id', (req, res, next) => {
	let id = req.params.id

	Reset.findOne({ key: id, status: 'Pending' })
		.then((result) => {
			if (result) {
				console.log('Code verified')
				res.redirect('/users/reset/' + result.email) //calls line number 132
			} else {
				console.log('Code invalid')
			}
		})
		.catch((e) => {
			console.log('Error ', e)
		})
})
router.get('/reset/:id', (req, res) => {
	let email = req.params.id
	res.render('reset', { email: email, layout: 'login' })
})
router.post('/reset', (req, res) => {
	const saltRounds = 10
	let pwd = req.body.password
	let email = req.body.email

	Users.updateOne(
		{ email: email },
		{ password: bcrypt.hashSync(pwd, saltRounds) },
		function (err, doc) {
			if (err) console.log(err)
			else {
				console.log('updated')
				res.render('login', {
					message:
						'Your password has been reset. Login with your new credetials',
					messageClass: 'alert-success alert-dismissible fade show',
					layout: 'login-vector',
				})
			}
		}
	)
})

//description: admin ban user
router.get('/ban/:id', ensureAuth, async (req, res) => {
	console.log('banned user')
	try {
		await Users.find({ _id: req.params.id }, (err, response) => {
			if (err) {
				console.log(err)
			} else {
				Users.updateOne(
					{ _id: req.params.id },
					{ ban: 1 },
					(err, response) => {
						if (err) {
							console.log(err)
						} else {
							console.log('banned user')
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

//description: admin unban user
router.get('/unban/:id', ensureAuth, async (req, res) => {
	console.log('banned user')
	try {
		await Users.find({ _id: req.params.id }, (err, response) => {
			if (err) {
				console.log(err)
			} else {
				Users.updateOne(
					{ _id: req.params.id },
					{ ban: 0 },
					(err, response) => {
						if (err) {
							console.log(err)
						} else {
							console.log('unbanned user')
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
		await Story.deleteMany({ user: req.params.id }, (err, response) => {
			if (err) {
				console.log(err)
			} else {
				Users.deleteOne({ _id: req.params.id }, (err, response) => {
					if (err) {
						console.log(err)
					} else {
						res.redirect('/adminallinfo')
					}
				})
			}
		})
	} catch (err) {
		console.error(err)
		res.render('error/500', { layout: 'errors' })
	}
})

module.exports = router
