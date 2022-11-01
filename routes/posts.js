const router = require('express').Router()
const Details = require('../models/details')
const User = require('../models/user')
const authenticate = require('../authenticate')
const cors = require('./cors')
const Post = require('../models/post')

router.route('/')
.options(cors.corsWithOptions,(req,res)=>{res.sendStatus(200)})
.put(cors.corsWithOptions,(req,res)=>{
    authenticate(req.headers.authorization).then((userid)=>{
      User.findOne({userId:userid}).then((user)=>{
        Post.create({userId:userid,
          caption:req.body.caption,img:req.body.image})
        .then((post)=>{
            res.status(200).json(post)
        })
      }).catch((err)=>res.status(500).json(err))

    }
    ).catch((err)=>{
      res.statusCode = 401;
      res.setHeader('Content-Type','application/json')
      res.json(err)
      console.log(err)
    })
   
})
.get(cors.cors,(req,res)=>{
  authenticate(req.headers.authorization).then((userid)=>{
      Details.findOne({userId:userid}).then((user)=>{   
        Post.find({userId:user.followings}).countDocuments().then((len)=>{
        var page = parseInt(req.query.p)
    Post.find({userId:user.followings}).skip(page*3-3).limit(3).sort({"createdAt":-1})
    .then((friendposts)=>{
      console.log(friendposts)
      var collection = []
      User.find({userId:user.followings}).then((users)=>{
        console.log(users)
        for(let i=0;i<friendposts.length;i++)
        {
          const p = friendposts[i]
          const u = users.find((item)=>{return item.userId===p.userId})
        if(p.img || p.caption)
         collection.push({_id:p._id,username:u.username,userId:u.userId,img:p.img,profilePicture:u.profilePicture,
          createdAt:p.createdAt,caption:p.caption,comments:p.comments.length,likes:p.likes})
        }
        return collection
      }).then((docs)=>{
        const pageCount = Math.ceil(len / 3);
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json')
        res.json({posts:docs,pages:pageCount})
       
      })
    })
    }).catch((err)=>{res.status(500).json(err)})
    })

  }).catch((err)=>{
    res.statusCode = 200;
    res.setHeader('Content-Type','application/json')
    res.json({response:"not authorized but posts will be added"})
  })
  })


router.route('/:id')
.options(cors.corsWithOptions,(req,res)=>{res.sendStatus(200)})
.delete(cors.corsWithOptions,(req, res) => {
  authenticate(req.headers.authorization).then((userid)=>{

    Post.findByIdAndRemove(req.params.id).then((post)=>{
      post.save();
      res.status(200).json(post)
    })
  }).catch((err)=>{
    res.statusCode = 401;
    res.setHeader('Content-Type','application/json')
    res.json(err)

  })
})


router.route('/:id/posts')
.options(cors.corsWithOptions,(req,res)=>{res.sendStatus(200)})
.get(cors.corsWithOptions,async (req, res) => {
  const userid = await authenticate(req.headers.authorization)
    // console.log(req.headers.authorization)
    User.findOne({userId:userid}).then((privacy)=>{
    Details.findOne({userId:userid},'followings').then((data)=>{
    if(data.followings.indexOf(req.params.id)!==-1 || privacy.private===false){
    Post.find({userId:req.params.id}).countDocuments().then((len)=>{
      const page = parseInt(req.query.p)
      Post.find({userId:req.params.id}).sort({"createdAt":-1}).skip(page*3-3).limit(3).then((posts)=>{
        User.findOne({userId:req.params.id}).then((user)=>{
          
        var collection = []
        for(i of posts)
        {
          if(i.img || i.caption)
          collection.push({_id:i._id,createdAt:i.createdAt,img:i.img,profilePicture:user.profilePicture,
          username:user.username,comments:i.comments.length,likes:i.likes,caption:i.caption,userId:user.userId})
        }
        const pageCount = Math.ceil(len / 3);
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json')
        res.json({posts:collection,pages:pageCount})
      })
      })
    })
  }
  else
  throw 'private';
  }).catch((err)=>{
    res.statusCode = 200;
    res.setHeader('Content-Type','application/json')
    res.json({posts:[],pages:0})
  })
})


// })
})

router.route('/:id/post')
.options(cors.corsWithOptions,(req,res)=>{res.sendStatus(200)})
.post(cors.corsWithOptions,(req, res) => {
  console.log(req.params.id)
  authenticate(req.headers.authorization).then((userid)=>{
    User.findOne({userId:userid}).then((user)=>{
      Post.findById(req.params.id).then((post)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json')
        const response= ({_id:post._id,createdAt:post.createdAt,img:post.img,profilePicture:user.profilePicture,
          username:user.username,comments:post.comments.length,likes:post.likes,caption:post.caption,userId:user.userId}) 
        
        res.json({post:response})
        })
        }).catch((err)=>{
          res.statusCode = 401;
          res.setHeader('Content-Type','application/json')
          res.json(err)
      })
      })
    })


router.route('/:userId/:id/getlikes')
.options(cors.corsWithOptions,(req,res)=>{res.sendStatus(200)})
.get(cors.corsWithOptions,(req, res) => {
  authenticate(req.headers.authorization).then((userid)=>{
      Post.findById(req.params.id).countDocuments().then((len)=>{
        const page = parseInt(req.query.p)
          Post.findById(req.params.id).skip(page*10-10).limit(10).then((posts)=>{
        const indices = posts.likes
          User.find({userId:indices},'username userId profilePicture').then((likes)=>{
           const pageCount = Math.ceil(len / 10);
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json')
        res.json({likes:likes,pages:pageCount})
      })
    })
  })
  }).catch((err)=>{
    res.statusCode = 401;
    res.setHeader('Content-Type','application/json')
    res.json(err)
  })

})



router.route('/:userId/:id/like')
.options(cors.corsWithOptions,(req,res)=>{res.sendStatus(200)})
.put(cors.corsWithOptions,(req, res) => {
  authenticate(req.headers.authorization).then((userid)=>{
    // User.findOne({userId:req.params.userId}).then((user)=>{
    Post.findById(req.params.id).then((post)=>{
        // if((user.posts.id(req.params.id).likes).indexOf(userid)===-1)
        if((post.likes).indexOf(userid)===-1){
        // user.posts.id(req.params.id).likes.push(userid)
        post.likes.push(userid)
      }
        else
        post.likes.splice(post.likes.indexOf(userid),1)
        // user.posts.id(req.params.id).likes.splice(user.posts.id(req.params.id).likes.indexOf(userid),1)
        post.save()
          })

  }).catch((err)=>{
    res.statusCode = 401;
    res.setHeader('Content-Type','application/json')
    res.json(err)
  })

})



router.route('/:id/:postid/comment')
.options(cors.corsWithOptions,(req,res)=>{res.sendStatus(200)})
.post(cors.cors,async (req,res)=>{
        authenticate(req.headers.authorization).then((userid)=>{
            // User.findOne({userId:req.params.id})
            Post.findById(req.params.postid)
            // .then((user)=>{
              .then((post)=>{
                // user.posts.id(req.params.postid).comments.push(
                  post.comments.push(
                  {userId:userid,
                  comment:req.body.comment,
                })

                Details.findOne({userId:req.params.id}).then((us)=>{
                  us.notifications.push({id:2,userId:userid,postId:req.params.postid,body:req.body.comment
                });
                User.findOne({userId:req.params.id}).then((user)=>{
                  user.notifications++;
                  user.save();
                })
                post.save();
                us.save()})
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
.get(cors.corsWithOptions,(req, res) => {
  authenticate(req.headers.authorization).then((userid)=>{
          Post.findById(req.params.postid).then((posts)=>{
            comments = posts.comments
            var users = []
            var collection = []
            const page = parseInt(req.query.p)
           const pageCount = Math.ceil(comments.length / 5);
            for (let i=0;i<comments.length;i++)
              users.push(comments[i].userId)
            User.find({userId:users}).then((arr)=>{
              for(let i=page*5-5;i<page*5;i++)
              {
                if(comments[i])
                {
                const user = arr.find((item)=>{return item.userId===users[i]})
                collection.push({comment:comments[i].comment,profilePicture:user.profilePicture,
                username:user.username,userId:comments[i].userId,_id:comments[i]._id})
                }
              }
                res.status(200).json({comments:collection,pages:pageCount})
            })
            
          })

  }).catch((err)=>{
    res.statusCode = 401;
    res.setHeader('Content-Type','application/json')
    res.json(err)
  })

})

router.route('/:id/:postid/comment/:commentid')
.options(cors.corsWithOptions,(req,res)=>{res.sendStatus(200)})
.delete(cors.cors,async (req,res)=>{
        authenticate(req.headers.authorization).then((userid)=>{
            User.findOne({userId:req.params.id})
            .then((user)=>{  
              Post.findById(req.params.postid).then((post)=>{
                if(userid==user.userId||userid===post.comments.id(req.params.commentid).userId)
                {
                post.comments.splice(post.comments.indexOf(post.comments.id(req.params.commentid)),1)
                post.save()
                .then(()=>{
                    res.statusCode = 200;
                    res.setHeader('Content-Type','application/json')
                    res.json({message:'successfully deleted'})
                })}
                else{
                    res.statusCode = 401;
                    res.setHeader('Content-Type','application/json')
                    res.json({err})
                }
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

router.route('/:id/:postid/comment/:commentid/like')
.options(cors.corsWithOptions,(req,res)=>{res.sendStatus(200)})
.put(cors.cors,async (req,res)=>{
        authenticate(req.headers.authorization).then((userid)=>{
            User.findOne({userId:req.params.id})
            .then((user)=>{

                user.posts.id(req.params.id).comments.id(req.params.commentid).likes = user.posts.id(req.params.id).comments.id(req.params.commentid).likes +1;
                user.save().then(()=>{
                    res.statusCode = 200;
                    res.setHeader('Content-Type','application/json')
                    res.json({message:'successfully deleted'})
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
  module.exports = router;