const mongoose=require('mongoose')

const UserScheme=new mongoose.Schema({
    googleId:{
        type: String,
        required: true
    },
    displayName:{
        type: String,
        required: true
    },
    email:{
        type: String
    },
    password:{
        type: String
    },
    image:{
        type: String
    },
    usertype:{
        type: String
    },
    ban:{
        type: Number
    },
    createdAt:{
        type: Date,
        default: Date.now
    }
})

module.exports=mongoose.model('User',UserScheme)