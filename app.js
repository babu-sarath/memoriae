const path = require('path')
const express = require('express')
const dotenv = require('dotenv')
const morgan = require('morgan')
const exphbs = require('express-handlebars')
const passport = require('passport')
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const connectDB = require('./config/db')

//load config
dotenv.config({ path: './config/config.env' })

const man = "asd"

//passport config
require('./config/passport')(passport)

connectDB()

const app = express()

//body parser to accept form data
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

//method override for edit/update
app.use(
	methodOverride(function (req, res) {
		if (req.body && typeof req.body === 'object' && '_method' in req.body) {
			// look in urlencoded POST bodies and delete it
			let method = req.body._method
			delete req.body._method
			return method
		}
	})
)

//logging stuffs
if (process.env.NODE_ENV == 'developement') {
	app.use(morgan('dev'))
}

//handlebar helpers
const {
	formatDate,
	stripTags,
	truncate,
	editIcon,
	select,
	isSameUser,
	newsbar,
} = require('./helpers/hbs')

//Handlebar(the view engine)
app.engine(
	'.hbs',
	exphbs({
		helpers: {
			formatDate,
			stripTags,
			truncate,
			editIcon,
			select,
			isSameUser,
			newsbar,
		},
		defaultLayout: 'main',
		extname: '.hbs',
	})
)
app.set('view engine', '.hbs')

//sessions middlewear
app.use(
	session({
		secret: 'asdlkajslkdjasda31235131asdasd5a4s3da1s',
		resave: false,
		saveUninitialized: false,
		store: new MongoStore({ mongooseConnection: mongoose.connection }),
	})
)
//passport middlewear
app.use(passport.initialize())
app.use(passport.session())

//set global variable for user
app.use(function (req, res, next) {
	res.locals.user = req.user || null
	next()
})

//Static folder for all misc stuff
app.use(express.static(path.join(__dirname, 'public')))

//Routes
app.use('/', require('./routes/index'))
app.use('/auth', require('./routes/auth'))
app.use('/stories', require('./routes/stories'))
app.use('/users', require('./routes/users'))
app.use('/news', require('./routes/news'))

const PORT = process.env.PORT || 3000

app.listen(
	PORT,
	console.log(
		`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
	)
)
