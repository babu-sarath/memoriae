const express = require('express')
const passport = require('passport')
const router = express.Router()

//description: Authenticate with google
router.get(
	'/google',
	passport.authenticate('google', {
		scope: ['profile', 'https://www.googleapis.com/auth/userinfo.email'],
	})
)

//description: google auth callback
router.get(
	'/google/callback',
	passport.authenticate('google', { failureRedirect: '/' }),
	(req, res) => {
		res.redirect('/stories')
	}
)

//description: logout user
router.get('/logout', (req, res) => {
	req.logout()
	res.redirect('/')
})

module.exports = router
