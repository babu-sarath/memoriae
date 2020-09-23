const mongoose=require('mongoose')

const StoryScheme=new mongoose.Schema({
    title:{
        type: String,
        required: true,
        trim:true
    },
    body:{
        type: String,
        required: true
    },
    status:{
        type: String,
        default: 'public',
        enum: ['public','private']
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    likes:{
        type: Number
    },
    reports:{
        type: Number
    },
    likedUsers:[{
        type: String
    }],
    reportedUsers:[{
        type: String
    }],
    ban:{
        type: Number
    },
    createdAt:{
        type: Date,
        default: Date.now
    }
})

module.exports=mongoose.model('Story',StoryScheme)