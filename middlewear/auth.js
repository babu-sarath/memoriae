module.exports={
    ensureAuth: function(req,res,next){
        
        if(req.isAuthenticated()){
            const typeofuser= req.user.usertype;
            return next()
            
        }else{
            res.redirect('/')
        }
    },

    ensureGuest: function(req,res,next){
        
        if(req.isAuthenticated()){
            const typeofuser= req.user.usertype;
            console.log(typeofuser)
            res.redirect('/dashboard')
        }else{
            return next()
        }
    }
    
}