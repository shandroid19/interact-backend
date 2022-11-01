const Messages = require('../models/messages')
const User = require('../models/user')
const Conversations = require('../models/conversations')
const router = require('express').Router();
const authenticate = require('../authenticate')
const cors = require('./cors')
const Details = require('../models/details')


router.route('/')
.options(cors.corsWithOptions,(req,res)=>{res.sendStatus(200)})
.get(cors.cors,(req,res)=>{
    authenticate(req.headers.authorization).then((userid)=>{
             
        if(req.query.id!=null){
            User.findOne({userId:req.query.id}).then((user)=>{    
                Conversations.findOne({
                    members:{$all: [userid,req.query.id]}
                }).then(conversation=>{
                    if(!conversation && req.query.id)
                    {
                        Conversations.create({members:[userid,req.query.id]}).then((stuff)=>{
                            res.statusCode=200;
                            res.json({profilePicture:user.profilePicture,username:user.username,conversationId:stuff._id})
                        })         
                    }
                    else{
                        Details.findOne({userId:userid}).then((details)=>{
                            
                            
                            if(details.unreadchat.indexOf(req.query.id)!==-1)
                            {   
                                details.unreadchat.splice(details.unreadchat.indexOf(req.query.id));
                                details.save()
                                User.findOne({userId:userid})
                                .then((user)=>{user.unreadchats = details.unreadchat.length;user.save()}) 
                            }
                            })   
                    res.status(200).json({profilePicture:user.profilePicture,username:user.username,conversationId:conversation._id})
                    }
                })
            })
        }else{

        Conversations.find({
            members:{$in:[userid]}
        }).then((convos)=>{
            var users=[]
            convos.map((item)=>{
                item.members[0]==userid?users.push(item.members[1]):users.push(item.members[0])
            })
            User.find({userId:users},'profilePicture username userId -_id updatedAt')
    
            .then((conversations)=>{
                console.log(conversations)
                conversations.sort((a,b)=>{return b.updatedAt-a.updatedAt;})
                Details.findOne({userId:userid},'unreadchat -_id').then((details)=>{
                console.log(details.unreadchat);
                res.status(200).json({conversations:conversations,unread:details.unreadchat})}
                )
            })
        })
    }
        
    }).catch((err)=>{
        res.status(500).json(err)
    })
})
// .post(cors.corsWithOptions,(req,res)=>{
//     authenticate(req.headers.authorization).then((userid)=>{
//         Conversations.findOne({userId:userid})
//         .then((user)=>{
//             Conversations.create({members:[userid,req.query.id]}).then((stuff)=>{
//                 if(stuff==0){
//                     user.register.push(req.body)
//                     user.save()
//                 }
//                 })
//         })
//     }).catch((err)=>{
//         res.status(500).json(err)
//     })
// })
router.route('/delete')
.options(cors.corsWithOptions,(req,res)=>res.sendStatus(200))
.get(cors.cors,(req,res)=>{
        Messages.findByIdAndRemove(req.query.params).then(()=>{
            res.statusCode = 200;
            res.setHeader('Content-Type','application/json')
            res.json({message:'success'})
        }).catch(()=>res.status(500).json({message:'deleted'}))
})


router.route('/sendmessage')
.options(cors.corsWithOptions,(req,res)=>res.sendStatus(200))
.post(cors.corsWithOptions,(req,res)=>{
    authenticate(req.headers.authorization).then((userid)=>{
        Messages.create({message:req.body.message,sender:userid,conversationId:req.body.conversationId}).then((conversation)=>{
            conversation.save().then((mes)=>{res.status(200).json({message:mes})})
        Conversations.findById(req.body.conversationId).then((doc)=>{
            if(doc)
            {  
  
            doc.updatedAt=Date.now()
            const receiver = doc.members[0]==userid?doc.members[1]:doc.members[0]
            Details.findOne({userId:receiver}).then((details)=>{
                if(details.unreadchat.indexOf(userid)===-1)
            {   
                details.unreadchat.push(userid);
                details.save()
                User.findOne({userId:receiver}).then((user)=>{
                    user.unreadchats = details.unreadchat.length;
                    user.save()

                }) 

            }
            })
        }
        })

        })
    })
})
router.route('/:conversationId')
.options(cors.corsWithOptions,(req,res)=>res.sendStatus(200))
.get(cors.cors,(req,res)=>{
    Messages.find({conversationId:req.params.conversationId}).countDocuments().then((len)=>{
    const page = parseInt(req.query.p)
            const pageCount = Math.ceil(len / 10);
    Messages.find({
        conversationId:req.params.conversationId
    },'sender message createdAt').skip((len-page*10)>=0?(len-page*10):0).limit(10).then((messages)=>{
        res.status(200).json({messages:messages,pages:pageCount});
    })
    }).catch((err)=>res.status(500).json(err))
})



router.route('/:id/unfollow')
.options(cors.corsWithOptions,(req,res)=>{res.sendStatus(200)})
.put(cors.cors,async (req,res)=>{
        authenticate(req.headers.authorization).then((userid)=>{
            User.findOne({userId:req.params.id})
            .then((user)=>{
                user.followers.splice(user.followers.indexOf(userid),1)
                user.save()
                User.findOne({userId:userid}).then((us)=>{us.followings.splice(us.followings.indexOf(req.params.id),1);us.save()})
                res.statusCode = 200;
                res.setHeader('Content-Type','application/json')
                res.json({message:'success'})
            }
        ).catch((err)=>{
            res.status(500).json(err)
        })
    }).catch((err)=>{
        res.statusCode = 401;
        res.setHeader('Content-Type','application/json')
        res.json({err})
    })
})

router.route('/')
.options(cors.corsWithOptions,(req,res)=>{res.sendStatus(200)})
.put(cors.corsWithOptions,async (req,res)=>{
    authenticate(req.headers.authorization).then((userid)=>{
        User.findOneAndUpdate({userId:userid},req.body,{returnOriginal:false})
        .then((user)=>{
        res.send(user)
        }
    ).catch((err)=>{
        res.status(500).json(err)
    })
}).catch((err)=>{
    res.statusCode =401
    res.json(err)
})
})

router.route('/get')
.options(cors.corsWithOptions,(req,res)=>{res.sendStatus(200)})
.get(cors.cors,async (req,res)=>{

    const ans = req.query.key?req.query.key:''
    User.find({username:{$regex:ans,$options:"i"}}).then((user)=>{

        var collection = [];
        for(let i=0;i<20 && i<user.length;i++)
        {
            collection.push({username:user[i].username,profilePicture:user[i].profilePicture,userId:user[i].userId})
        }
        
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json')
        res.json(collection)
}).catch((err)=>{
    res.statusCode =401
    res.json(err)
})
})



module.exports = router
       // Conversations.aggregate([{$match:{userId:userid}},{$addFields:{register:{$filter:{input:"$register",cond:{$eq:["$$this.userId",req.query.id]}}}}}]).then((user)=>{
        //    console.log(user[0])
        //     res.statusCode = 200;
        //     res.setHeader('Content-Type','application/json')
        //     res.json({conversations:user[0].register})
        // })