const router = require('express').Router();
const User = require("../models/user");
const Details = require("../models/details")
const Conversations = require('../models/conversations')
// const bcrypt = require('bcrypt');
const authenticate = require('../authenticate');
const cors = require('./cors');
const Newusers = require('../models/newUsers')
// const passport = require('passport');


router.route('/login')
.options(cors.corsWithOptions,(req,res)=>{res.sendStatus(200)})
.post(cors.cors,async (req,res)=>{
    
    authenticate(req.headers.authorization).then((userid)=>{
        console.log(userid)
        User.findOne({userId:userid},'userId name username profilePicture city bio darkmode private notifications unreadchats').then((user)=>{
            if(!user) throw new Error('not found')
            Newusers.find({}).then((newusers)=>{
                res.statusCode = 200;
                res.setHeader('Content-Type','application/json')
                res.json({status:'logged in successfully', user: user,newusers:newusers})
            })
            // const response = {userId:user[0].googleId,username:user[0].username,profilePicture:user[0].profilePicture,city:user[0].city,bio:user[0].bio,posts:user[0].posts} 

            }).catch(err=>{    res.statusCode = 500;
                res.setHeader('Content-Type','application/json')
                res.json(err)
                console.log(err)})
    })
    .catch((err)=>{
        res.statusCode = 403;
        res.setHeader('Content-Type','application/json')
        res.json(err)
        console.log(err)
    });

    
})

router.route('/signup')
.options(cors.corsWithOptions, (req,res)=>{res.sendStatus(200)})
.post(cors.cors,(req,res)=>{
    Details.find({username:req.body.username}).then((users)=>{
        if(users.length)
        {

        res.statusCode = 500;
        res.setHeader('Content-Type','application/json')
        res.json({"error":"user exists"})
        }
        else{
            authenticate(req.headers.authorization).then((userid)=>{
                console.log(userid)
                User.create({userId:userid,name:req.body.name,username:req.body.username,email:req.body.email,city:req.body.city,
                    profilePicture:req.body.profilePicture,
                    bio:req.body.bio,darkmode:req.body.dark,private:req.body.priv}) 
                .then((user)=>{
                const saved = user.save()
                Details.create({userId:userid,followers:userid,followings:userid})
                .then(()=>{Conversations.create({userId:userid})})
                    res.statuscode = 200;
                    res.setHeader('Content-Type','application/json')
                    res.json({success: true,user:saved,status: 'registration successful'})
                })
                .catch((err)=>{
                res.statusCode = 500;
                    res.setHeader('Content-Type','application/json')
                    res.json(err)
                console.log(err)
                })
            }).catch((err)=>{res.statusCode = 500;
                res.setHeader('Content-Type','application/json')
                res.json({"error":err})
            })

        }
    })
})
//     router.route('/signup')
//     .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
//     .post(cors.cors,(req,res,next)=>{
//     users = new User({username:req.body.username, email:req.body.email,profilePicture:req.body.profilePicture,coverPicture:req.body.coverPicture,city:req.body.city,bio:req.body.bio})
//     User.register(users,
//     req.body.password, (err,user)=>{
//         if(err){
//             res.statusCode = 500;
//             res.setHeader('Content-Type','application/json');
//             res.json({err:err});
//             console.log(err)
//             // res.send(req.body)
//         }
//         else{
//             passport.authenticate('local')(req,res,()=>{
//                 res.statuscode = 200;
//                 res.setHeader('Content-Type','application/json')
//                 res.json({success: true,user:req.user,status: 'registration successful'})
//             })
//         }
//     })
// })
// router.route('/logout')
// .options(cors.corsWithOptions,(req,res)=>{res.sendStatus(200)})
// .get(cors.cors,authenticate.verifyUser,(req,res)=>{
//     try{
//         req.logOut();
//         res.statusCode = 200;
//         res.setHeader('Content-Type','application/json')
//         res.json({success:true,user:req.user,status:'successfully logged out'})
//     }
//     catch(err){
//         console.log(err)
//         res.status(401).json(err)
//     }
//     }).options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })

// router.route('/login')
// .options(cors.corsWithOptions,(req,res)=>{res.sendStatus(200)})
// .post(cors.cors,passport.authenticate('local'),(req,res)=>{
//     try{
//     var token = authenticate.getToken({_id: req.user._id});
//         res.statusCode = 200;
//         res.setHeader('Content-Type','application/json')
//         res.json({success:true,token:token,user:req.user,status:'successfully logged in'})
//     }
//     catch(err){
//         console.log(err)
//         res.status(401).json(err)
//     }
//     }).options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })

module.exports = router;