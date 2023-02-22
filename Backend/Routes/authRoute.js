const router = require('express').Router()
const passport = require('passport')

const { autherisotionMiddleware,authoriseJwt } = require('../utilities/authorisation')
const auth_Controller= require('../Controllers/auth_controller')


const {CLIENT_URL} = process.env





//google auth


//test route for google auth

// router.get('/',(req,res)=>{
//     res.send("<a href=/auth/google>Signin with google</a>")
// })

router.get('/loginsuccess',autherisotionMiddleware,auth_Controller.LoginSuccess)

router.get('/loginfailed',auth_Controller.LoginFailed)

router.get('/google',passport.authenticate('google', { scope: [ 'email', 'profile' ] }));

router.get('/google/callback',passport.authenticate('google', {failureRedirect: '/auth/loginfailed' , successRedirect:'/auth/loginsuccess'}));



module.exports = router