const express = require('express')
const passport = require('passport')
const bcrypt = require('bcrypt')

const Story = require('../models/Story')
const Users = require('../models/Users')

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
	let errors = []
	const saltRounds = 10

	//check passowrds match
	if (password != password2) {
		errors.push({ msg: 'Password do not match' })
	}
	//check password length
	if (password.length < 6) {
		errors.push({ msg: 'Password should be at least 6 characters' })
	}
	if (image == '') {
		image =
			'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcS-16y4LKaxCJWkLi3x8tXLnTLnwKZfkE2l-g&usqp=CAU'
	}
	if (errors.length > 0) {
		res.render('error/passwordError', { layout: 'login' })
	} else {
		Users.findOne({ email: email }).then((user) => {
			if (user) {
				res.render('error/userExistError', { layout: 'login' })
			} else {
				const newUser = new Users({
					googleId: 'null',
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
						res.redirect('/')
					})
					.catch((err) => console.log(err))
			}
		})
	}
})

//description: login error handle
router.get('/loginerror', (req, res) => {
	res.render('error/loginProblem', { layout: 'login' })
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
		res.render('error/500')
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
		res.render('error/500')
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
		res.render('error/500')
	}
})

module.exports = router
