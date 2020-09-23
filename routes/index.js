const express=require('express')
const router=express.Router()
const {ensureAuth,ensureGuest}=require('../middlewear/auth')
const Story=require('../models/Story')
const Users = require('../models/Users')

//description: login/landing page
router.get('/', ensureGuest, (req,res)=>{
    res.render('login',
    {
        layout:'login-vector',
    })
})

//description: dashboard page
router.get('/dashboard', ensureAuth, async(req,res)=>{
    try {
        const stories=await Story.find({user: req.user.id}).lean()
        res.render('dashboard', {
            name: req.user.displayName,
            stories
        })
    } catch (err) {
        console.error(err)
        res.render('error/500')
    }
})

//description: admin dashboard page
router.get('/admindash', ensureAuth, async(req,res)=>{
    try {
        let storyCount,usersCount
        await Story.estimatedDocumentCount({status: 'public'}, (err,result)=>{
            if(err){
                console.log(err)
            }else{
                storyCount=result
            }
        })
        await Users.estimatedDocumentCount({usertype: {$ne:"admin"}}, (err,result)=>{
            if(err){
                console.log(err)
            }else{
                usersCount=result
            }
        })

        res.render('admindash', {
            layout: 'admin',
            storyCount,usersCount
        })

    } catch (err) {
        console.error(err)
        res.render('error/500')
    }
})

router.get('/adminallinfo', ensureAuth, async(req,res)=>{
    try {
        const stories=await Story.find({status: 'public'}).lean()
        const users=await Users.find({usertype: {$ne:"admin"}}).lean()
        res.render('adminallinfo', {
            layout: 'admin',
            stories, users
        })
    } catch (err) {
        console.error(err)
        res.render('error/500')
    }
})

module.exports=router