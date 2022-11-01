const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose')

const CommentSchema = new mongoose.Schema(
  {
    userId:{
      type:String
    },
    username: {
      type: String,
      required: true,
    },
    profilePicture:{
      type:String
    },
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
      type:String
    },
    username: {
      type: String,
      required: true,
    },
    profilePicture:{
      type:String
    },
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
 
const Users = new Schema(
  {
    userId:{
      type:String,
      required:true,
      index:true
    },
    name:{
      type:String,
      default:""
    },
    username: {
      type: String,
      required: true,
      min: 3,
      max: 20,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      max: 50
    },
    password: {
      type: String,
      min: 8,
    },
    profilePicture: {
      type: String,
      default: "",
    },
    coverPicture: {
      type: String,
      default: "",
    },
    notifications:{
      type: Number,
      default: 0
    },
    private:{
      type:Boolean
    },
    darkmode:{
      type:Boolean,
      default:false
    },

    bio: {
      type: String,
      max: 50,
    },
    city: {
      type: String,
      max: 50,
    },
    unreadchats:{
      type:Number,
      default:0
    },
    posts: [PostSchema]
  },
  { timestamps: true }
);

// var User = new Schema({
//   admin:   {
//       type: Boolean,
//       default: false
//   }
// });

// Users.plugin(passportLocalMongoose);
module.exports = mongoose.model("users", Users);
// const UserModel = new Schema({
//     username:{type: String, required:true, unique:true},
//     password:{type:String, required: true},
//     role: {type:String, required:true}
// });

// UserModel.set('toJSON',{getters:true});
// UserModel.options.toJSON.transform = (doc,ret)=>{
//     const obj = {...ret};
//     delete obj._id;
//     delete obj.__v;
//     delete obj.password;
//     return obj;
// };

