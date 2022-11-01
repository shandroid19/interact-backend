const mongoose = require("mongoose");


const notificationSchema = new mongoose.Schema(
  {
      id:{
        type:Number
      },
      body:{
        type:String
      },
      userId:{
        type:String
      },
      postId:{
        type:String
      },
  },{timestamps:true}

)


const DetailSchema = new mongoose.Schema(
  {
    userId:{
      type:String
    },
    followers:{
      type:Array,
      default:[]
    },
    followings:{
      type:Array,
      default:[]
    },
    requests:{
      type:Array,
      default:[]
    },
    requested:{
      type:Array,
      default:[]
    },
    unreadchat:{
      type:Array,
      default:[]
    },

    notifications:[notificationSchema]
  },
  { timestamps: true }
);



module.exports = mongoose.model("Details", DetailSchema);
