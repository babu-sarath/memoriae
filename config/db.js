const mongoose = require('mongoose')

const connectDB = async () => {
	try {
		const conn = mongoose.connect(process.env.MONGO_URI_ATLAS, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useFindAndModify: false,
			useCreateIndex: true,
		})
		console.log(`Mongo DB Connected :${(await conn).connection.host}`)
	} catch (err) {
		console.error(err)
		process.exit(1)
	}
}

module.exports = connectDB
