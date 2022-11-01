const mongoose = require("mongoose");
const CommentSchema = new mongoose.Schema(
  {
    userId:{
      type:String
    },
    // username: {
    //   type: String,
    //   required: true,
    // },
    // profilePicture:{
    //   type:String
    // },
    comment: {
      type: String,
      max: 500,
    },
    likes:{
      type: Number,
      default: 0
    },
  },
  { timestamps: true }
);


const PostSchema = new mongoose.Schema(
    {
      userId:{
        type:String,
        index:true
      },
      // username: {
      //   type: String,
      //   required: true,
      // },
      // profilePicture:{
      //   type:String
      // },
      caption: {
        type: String,
        max: 500,
      },
      img: {
        type: String,
      },
      public:{
        type:Boolean,
        default:true
      },
      likes: {
        type: Array,
        default: [],
      },
      comments: [CommentSchema]
    },
    { timestamps: true }
  );
  module.exports = mongoose.model('posts',PostSchema)
