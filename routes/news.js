const express=require('express')
const router=express.Router()
const News=require('../models/News')

//description: create new news request
router.post('/createNews',(req,res)=>{

    var today = new Date();
    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();

    console.log(req.body.news)   
    const newNews=new News(
        {
            newsUpdate: req.body.news,
            createdAt: date
        }
    )
    newNews.save().then(
        user=>{
            res.redirect('/admindash')
        }
    ).catch(err =>{
        console.log(err)
        res.redirect('/admindash')
    })
})


module.exports=router