const express = require('express')
const passport = require('passport')
const nodemailer = require('nodemailer')
const dotenv = require('dotenv')
const router = express.Router()
const Users = require('../models/Users')
const Reset = require('../models/Reset')

//load config
dotenv.config({ path: './config/config.env' })

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

//forgot password
router.post('/forgotPassword', (req, res) => {
	let inputEmail = req.body.femail
	const EMAIL = process.env.EMAIL
	const PWD = process.env.PASSWORD
	var transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: EMAIL,
			pass: PWD,
		},
	})

	//generate random id
	let uid = ''
	let charset =
		'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
	for (var i = 0, n = charset.length; i < 10; ++i) {
		uid += charset.charAt(Math.floor(Math.random() * n))
	}

	var mailOptions = {
		from: EMAIL,
		to: inputEmail,
		subject: 'Password Reset for Memoriae',
		html:
			'<html lang="en"><head> <meta charset="UTF-8"> <meta name="viewport" content="width=device-width, initial-scale=1.0"> <title>Document</title> <!-- CSS --><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/css/bootstrap.min.css" integrity="sha384-TX8t27EcRE3e/ihU7zmQxVncDAy5uIKz4rEkgIXeMed4M0jlfIDPvg6uqKI2xXr2" crossorigin="anonymous"><!-- jQuery and JS bundle w/ Popper.js --><script src="https://code.jquery.com/jquery-3.5.1.slim.min.js" integrity="sha384-DfXdz2htPH0lsSSs5nCTpuj/zy4C+OGpamoFVy38MVBnE+IbbVYUew+OrCXaRkfj" crossorigin="anonymous"></script><script src="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-ho+j7jyWK8fNQe+A12Hb8AhRq26LrZ/JpcUGGOn+Y7RsweNrtN/tE3MoK7ZeZDyx" crossorigin="anonymous"></script></head><body> <table class="body-wrap" style="font-family: "Helvetica Neue",Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; width: 100%; background-color: #f6f6f6; margin: 0;" bgcolor="#f6f6f6"> <tbody> <tr style="font-family: "Helvetica Neue",Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"> <td style="font-family: "Helvetica Neue",Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0;" valign="top"></td> <td class="container" width="600" style="font-family: "Helvetica Neue",Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; display: block !important; max-width: 600px !important; clear: both !important; margin: 0 auto;" valign="top"> <div class="content" style="font-family: "Helvetica Neue",Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; max-width: 600px; display: block; margin: 0 auto; padding: 20px;"> <table class="main mt-5" width="100%" cellpadding="0" cellspacing="0" style="font-family: "Helvetica Neue",Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; border-radius: 3px; background-color: #fff; margin: 0; border: 1px solid #e9e9e9;" bgcolor="#fff"> <tbody> <tr style="font-family: "Helvetica Neue",Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"> <td class="" style="font-family: "Helvetica Neue",Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 16px; vertical-align: top; color: #fff; font-weight: 500; text-align: center; border-radius: 3px 3px 0 0; background-color: #38414a; margin: 0; padding: 20px;" align="center" bgcolor="#71b6f9" valign="top"> <a href="#" style="font-size:32px;color:#fff;"> Password Reset</a> <br> </td> </tr> <tr style="font-family: "Helvetica Neue",Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"> <td class="content-wrap" style="font-family: "Helvetica Neue",Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 20px;" valign="top"> <table width="100%" cellpadding="0" cellspacing="0" style="font-family: "Helvetica Neue",Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"> <tbody> <tr style="font-family: "Helvetica Neue",Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"> <td class="content-block" style="font-family: "Helvetica Neue",Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 0 0 20px;" valign="top"> Tap the button below to reset your customer account password. If you didn"t request a new password, you can safely delete this email. </td> </tr> <tr style="font-family: "Helvetica Neue",Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"> <td class="content-block" style="font-family: "Helvetica Neue",Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 0 0 20px;" valign="top"> <a href="http://localhost:3000/users/passwordReset/' +
			uid +
			'" class="btn-primary" style="font-family: "Helvetica Neue",Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; color: #FFF; text-decoration: none; line-height: 2em; font-weight: bold; text-align: center; cursor: pointer; display: inline-block; border-radius: 5px; text-transform: capitalize; background-color: #f1556c; margin: 0; border-color: #f1556c; border-style: solid; border-width: 8px 16px;">Change my password</a> </td> </tr> <tr style="font-family: "Helvetica Neue",Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"> <td class="content-block" style="font-family: "Helvetica Neue",Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 0 0 20px;" valign="top"> Thanks You, Admin. </td> </tr> </tbody> </table> </td> </tr> </tbody> </table> <div class="footer" style="font-family: "Helvetica Neue",Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; width: 100%; clear: both; color: #999; margin: 0; padding: 20px;"> <table width="100%" style="font-family: "Helvetica Neue",Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"> <tbody> <tr style="font-family: "Helvetica Neue",Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;"> <td class="aligncenter content-block" style="font-family: "Helvetica Neue",Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 12px; vertical-align: top; color: #999; text-align: center; margin: 0; padding: 0 0 20px;" align="center" valign="top">You received this email because we received a request for password reset for your account. If you didn"t request this, you can safely delete this email. </td> </tr> </tbody> </table> </div> </div> </td> <td style="font-family: "Helvetica Neue",Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0;" valign="top"></td> </tr> </tbody></table></body></html>',
	}

	Users.findOne({ email: inputEmail }).then((user) => {
		if (user) {
			//insert new key to db
			const newKey = new Reset({
				email: inputEmail,
				key: uid,
				status: 'Pending',
			})

			newKey
				.save()
				.then((status) => {
					console.log(status)

					//sendong mail
					transporter.sendMail(mailOptions, function (error, info) {
						if (error) {
							console.log(error)
						} else {
							res.render('login', {
								message:
									'Follow instructions sent to your email to proceed with the password reset.',
								messageClass:
									'alert-success alert-dismissible fade show',
								success: 'yes',
								layout: 'login-vector',
							})
							console.log('Email sent: ' + info.response)
						}
					})
				})
				.catch((e) => {
					console.log(e)
				})
		} else {
			res.render('login', {
				message:
					'The email seems to be not registered with Memoriae. Sign up to Memoriae instead.',
				messageClass: 'alert-danger alert-dismissible fade show',
				layout: 'login-vector',
			})
		}
	})
})

module.exports = router
