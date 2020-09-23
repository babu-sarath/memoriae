const mongoose=require('mongoose')

const UserScheme=new mongoose.Schema({
    newsUpdate:{
        type: String,
        required: true
    },
    createdAt:{
        type: String,
        required: true
    }
})

module.exports=mongoose.model('News',UserScheme)