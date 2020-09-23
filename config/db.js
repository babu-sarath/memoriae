const mongoose=require('mongoose')

const connectDB= async() =>{
    try {
            const conn=mongoose.connect(process.env.MONGO_URI,{
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false
        })
        console.log(`Mongo DB Connected :${(await conn).connection.host}`)
    } catch (err) {
        console.error(err)
        process.exit(1)
    }
}

module.exports=connectDB