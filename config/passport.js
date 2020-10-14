const GoogleStrategy = require('passport-google-oauth20').Strategy
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
const User = require('../models/Users')

module.exports = function (passport) {
	passport.use(
		new GoogleStrategy(
			{
				clientID: process.env.GOOGLE_CLIENT_ID,
				clientSecret: process.env.GOOGLE_CLIENT_SECRET,
				callbackURL: '/auth/google/callback',
			},
			async (accessToken, refreshToken, profile, done) => {
				let ban = 0
				let usertype = 'user'
				const newUser = {
					userId: profile.id,
					displayName: profile.displayName,
					email: profile.emails[0].value,
					image: profile.photos[0].value,
					usertype: usertype,
					ban: ban,
				}
				try {
					let user = await User.findOne({ googleId: profile.id })
					if (user) {
						done(null, user)
					} else {
						user = await User.create(newUser)
						done(null, user)
					}
				} catch (error) {
					console.error(error)
				}
			}
		)
	)

	passport.use(
		new LocalStrategy(
			{ usernameField: 'email' },
			(email, password, done) => {
				//search user
				User.findOne({ email: email, usertype: 'user' })
					.then((user) => {
						if (!user) {
							//search admin because user not found
							User.findOne({ email: email, usertype: 'admin' })
								.then((user) => {
									if (!user) {
										return done(null, false)
									}
									//check if passwords are same for admin
									bcrypt.compare(
										password,
										user.password,
										(err, res) => {
											if (!err) {
												if (res) {
													return done(null, user)
												} else {
													return done(null, false)
												}
											} else {
												console.log(err)
											}
										}
									)
								})
								.catch((err) => console.log(err))
						}
						//user found, check if passwords are same for user
						bcrypt.compare(password, user.password, (err, res) => {
							if (!err) {
								if (res) {
									return done(null, user)
								} else {
									return done(null, false)
								}
							} else {
								console.log(err)
							}
						})
					})
					.catch((err) => console.log(err))
			}
		)
	)

	passport.serializeUser((user, done) => {
		done(null, user.id)
	})

	passport.deserializeUser((id, done) => {
		User.findById(id, (err, user) => done(err, user))
	})
}
