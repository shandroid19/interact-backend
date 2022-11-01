const User = require('../models/user')
const Details = require('../models/details')

const router = require('express').Router();
const bcrypt = require('bcrypt')
const authenticate = require('../authenticate')
const cors = require('./cors')
// router.get('/', authenticate.verifyUser, async(req,res)=>{

// })
router.route('/:id/get')
.options(cors.corsWithOptions,(req,res)=>{res.sendStatus(200)})
.get(cors.cors, (req,res)=>{
        User.findOne({userId:req.params.id})
        .then(async (user)=>{
            const userr = await Details.findOne({userId:req.params.id})
            // console.log({userId:user.userId,username:user.username,name:user.name,followers:userr.followers,followings:userr.followings,profilePicture:user.profilePicture,city:user.city,bio:user.bio,requests:userr.requests,private:user.private,darkmode:user.darkmode})
            res.statusCode = 200;
            res.setHeader('Content-Type','application/json')
            res.json({userId:user.userId,username:user.username,name:user.name,followers:userr.followers,followings:userr.followings,profilePicture:user.profilePicture,city:user.city,bio:user.bio,requests:userr.requests,requested:userr.requested,private:user.private,darkmode:user.darkmode})
      
        }
    ).catch((err)=>{
        res.status(500).json(err)
    })

})

router.route('/notifications')
.options(cors.corsWithOptions,(req,res)=>{res.sendStatus(200)})
.get(cors.cors, (req,res)=>{
        authenticate(req.headers.authorization).then((userid)=>{
            const page = parseInt(req.query.p)
            Details.findOne({userId:userid},'-_id notifications requests').then((forlength)=>{
                const pages = Math.ceil(forlength.requests.length/10);
            Details.findOne({userId:userid},'requests -_id').skip(page*10-10).limit(10)
            .then((user)=>{
                var notifications = []
                    for(let i=0;i<forlength.notifications.length;i++){
                        notifications.push(forlength.notifications[i].userId)
                }
                User.find({userId:user.requests},'userId username profilePicture').then((us)=>{
                    User.find({userId:notifications}).then((userlist)=>{

                        const alerts = []
                        for(let i=0;i<notifications.length;i++){
                            const notification = forlength.notifications[i]
                            const userdetails = userlist.find((item)=>item.userId===notification.userId)
                            alerts.push({id:notification.id,userId:userdetails.userId,
                            profilePicture:userdetails.profilePicture,postId:notification.postId,
                            username:userdetails.username,body:notification.body})
                        } 
                        // console.log({alerts:alerts,requests:us,alertpages:alertpages,requestpages:requestpages})
                        res.statusCode = 200;
                        res.setHeader('Content-Type','application/json')
                        res.json({alerts:alerts,requests:us,pages:pages})
                    })
                })
                })
            })
                // User.findOne({userId:userid}).then((doc)=>{
                //     doc.notifications= 0;
                //     doc.save();
                // })
            }
        ).catch((err)=>{
            res.status(500).json(err)
        })

        .catch((err)=>{res.statusCode=401;res.setHeader('Content-Type','application/json');res.json({err})})
})

router.route('/clearnotifications')
.options(cors.corsWithOptions,(req,res)=>{res.sendStatus(200)})
.get(cors.cors, (req,res)=>{
        authenticate(req.headers.authorization).then((userid)=>{
            Details.findOne({userId:userid},'notifications')
            .then((user)=>{  
                User.findOne({userId:userid})
                .then((us)=>{us.notifications = 0;us.save()}).then(()=>{
                    user.notifications = [];
                    user.save();
                    res.status(200).json({message:"successful"})
                }) 
            }
        ).catch((err)=>{
            res.status(500).json(err)
        })
        })
        .catch((err)=>{res.statusCode=401;res.setHeader('Content-Type','application/json');res.json({err})})
})


router.route('/:id/sendrequest')
.options(cors.corsWithOptions,(req,res)=>{res.sendStatus(200)})
.post(cors.cors, (req,res)=>{
        authenticate(req.headers.authorization).then((userid)=>{
            Details.findOne({userId:req.params.id}).then( (otherdetails)=>{
            User.findOne({userId:req.params.id}).then((otheruser)=>{
            Details.findOne({userId:userid}).then((thisdetails)=>{
            User.findOne({userId:userid}).then((thisuser)=>{

                const priv = otheruser.private
                if(priv)
                {
                otherdetails.requests.push(userid)
                otheruser.notifications++;
                thisdetails.requested.push(req.params.id);
                }
                else
                {
                    otherdetails.followers.push(userid)
                    otheruser.notifications++;
                    thisdetails.followings.push(req.params.id);  
                    otherdetails.notifications.push({userId:thisuser.userId,id:0})                        
              
                }
                
                otherdetails.save()
                thisdetails.save();
                otheruser.save();
                res.statusCode = 200;
                res.setHeader('Content-Type','application/json')
                res.json({message:'success'})
            })
            })
            })
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

router.route('/:id/cancelrequest')
.options(cors.corsWithOptions,(req,res)=>{res.sendStatus(200)})
.delete(cors.cors, (req,res)=>{
        authenticate(req.headers.authorization).then((userid)=>{
            Details.findOne({userId:req.params.id})
            .then((user)=>{
                user.requests.splice(user.requests.indexOf(userid),1)
                User.findOne({userId:req.params.id}).then((toincrement)=>{toincrement.notifications--;toincrement.save();})
                Details.findOne({userId:userid}).then((us)=>{us.requested.splice(us.requested.indexOf(req.params.id)),us.save()});
                user.save()
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




router.route('/:id/acceptrequest')
.options(cors.corsWithOptions,(req,res)=>{res.sendStatus(200)})
.post(cors.cors, (req,res)=>{
        authenticate(req.headers.authorization).then((userid)=>{
            Details.findOne({userId:req.params.id})
            .then((otherdetails)=>{
                otherdetails.requested.splice(otherdetails.requested.indexOf(userid),1)
                Details.findOne({userId:userid}).then((thisdetails)=>{
                User.findOne({userId:userid}).then((thisuser)=>{
                    User.findOne({userId:req.params.id}).then((otheruser)=>{
                        otherdetails.notifications.push({userId:userid,id:1})
                        otheruser.notifications++;
                        thisdetails.notifications.push({userId:otheruser.userId,id:0})
                        otherdetails.followings.push(userid)
                        otherdetails.save()
                        otheruser.save()
                        thisdetails.followers.push(req.params.id);
                        thisdetails.requests.splice(thisdetails.requests.indexOf(req.params.id));
                        thisdetails.save()
                        thisuser.save()
                    })


                })



            });
   
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



router.route('/:id/rejectrequest')
.options(cors.corsWithOptions,(req,res)=>{res.sendStatus(200)})
.delete(cors.cors, (req,res)=>{
        authenticate(req.headers.authorization).then((userid)=>{
            Details.findOne({userId:req.params.id})
            .then((user)=>{
                user.requested.splice(user.requested.indexOf(userid),1)
                user.save()
                Details.findOne({userId:userid}).then((us)=>{us.requests.splice(us.requests.indexOf(req.params.id));us.notifications--;us.save()});
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



// router.route('/:id/follow')
// .options(cors.corsWithOptions,(req,res)=>{res.sendStatus(200)})
// .put(cors.cors,async (req,res)=>{
//         authenticate(req.headers.authorization).then((userid)=>{
//             Details.findOne({userId:req.params.id})
//             .then((user)=>{
//                 user.followers.push(userid)

//                 user.save()
//                 Details.findOne({userId:userid}).then((us)=>{us.followings.push(req.params.id);console.log(us.followings);us.save()})
//                 User.findOne({userId:req.params.id}).then((us)=>{
//                     console.log(us)
//                     user.notifications.push({userId:us.userId,body:'started following you.',username:us.username,profilePicture:us.profilePicture,id:0})
//                     user.save()
//                 })
//                 res.statusCode = 200;
//                 res.setHeader('Content-Type','application/json')
//                 res.json({message:'success'})
//             }
//         ).catch((err)=>{
//             res.status(500).json(err)
//         })
//     }).catch((err)=>{
//         res.statusCode = 401;
//         res.setHeader('Content-Type','application/json')
//         res.json({err})
//     })
// })

router.route('/:id/unfollow')
.options(cors.corsWithOptions,(req,res)=>{res.sendStatus(200)})
.put(cors.cors,async (req,res)=>{
        authenticate(req.headers.authorization).then((userid)=>{
            Details.findOne({userId:req.params.id})
            .then((user)=>{
                user.followers.splice(user.followers.indexOf(userid),1)
                user.save()
                Details.findOne({userId:userid}).then((us)=>{us.followings.splice(us.followings.indexOf(req.params.id),1);us.save()})
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


// router.route('/:id/followers')
// .options(cors.corsWithOptions,(req,res)=>{res.sendStatus(200)})
// .get(cors.corsWithOptions,async (req,res)=>{
//     authenticate(req.headers.authorization).then((userid)=>{
//         Details.findOne({userId:req.params.id},'followers')
//         .then((user)=>{
//             User.find({userId:user.followers},'profilePicture username userId').then((us)=>
//             {
//                 res.statusCode =200
//                 res.setHeader('Content-Type','application/json')
//                 res.json(us)
//             })
//         }
//     ).catch((err)=>{
//         res.status(500).json(err)
//     })
// }).catch((err)=>{
//     res.statusCode =401
//     res.json(err)
// })
// })

router.route('/:id/followers')
.options(cors.corsWithOptions,(req,res)=>{res.sendStatus(200)})
.get(cors.corsWithOptions,async (req,res)=>{
    authenticate(req.headers.authorization).then((userid)=>{
        
        Details.findOne({userId:req.params.id}).countDocuments()
        .then((len)=>{
            const page = parseInt(req.query.p)            
            console.log('hey')

        Details.findOne({userId:req.params.id},'followers').skip(page*10-10).limit(10)
        .then((user)=>{
            const pageCount = Math.ceil(len / 10);
            User.find({userId:user.followers},'profilePicture username userId').then((us)=>
            {
                res.statusCode =200
                res.setHeader('Content-Type','application/json')
                res.json({followers:us,pages:pageCount})
            })
        }
    ).catch((err)=>{
        res.status(500).json({followers:[]})
    })
    })

}).catch((err)=>{
    res.statusCode =401
    res.json(err)
})
})

router.route('/:id/followings')
.options(cors.corsWithOptions,(req,res)=>{res.sendStatus(200)})
.get(cors.corsWithOptions,async (req,res)=>{
    authenticate(req.headers.authorization).then((userid)=>{
        
        Details.findOne({userId:req.params.id}).countDocuments()
        .then((len)=>{
            const page = parseInt(req.query.p)

        Details.findOne({userId:req.params.id},'followings').skip(page*10-10).limit(10)
        .then((user)=>{
            const pageCount = Math.ceil(len / 10);
            User.find({userId:user.followings},'profilePicture username userId').then((us)=>
            {
                res.statusCode =200
                res.setHeader('Content-Type','application/json')
                res.json({followings:us,pages:pageCount})
            })
        }
    ).catch((err)=>{
        res.status(500).json({followings:[]})
    })
    })

}).catch((err)=>{
    res.statusCode =401
    res.json(err)
})
})



router.route('/get')
.options(cors.corsWithOptions,(req,res)=>{res.sendStatus(200)})
.get(cors.cors,async (req,res)=>{
    console.log(req.query.key)
    const ans = req.query.key?req.query.key:''
    User.find({username:{$regex:ans,$options:"i"}},'username profilePicture userId -_id').limit(10).then((collection)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json')
        res.json(collection)
}).catch((err)=>{
    res.statusCode =401
    res.json([])
})
})



module.exports = router