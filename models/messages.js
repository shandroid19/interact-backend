const mongoose = require("mongoose");

const messagesSchema = new mongoose.Schema(
  {
    conversationId:{
      type:String
    },
    message:{
      type:String
    },
    sender:{
      type:String
    }
  },{timestamps:true}
)
// const messagesSchema =  new mongoose.Schema(
//   {
//     userId:{
//       type:String
//     },
//     message:{
//       type:String
//     },
//   },{timestamps:true}
// )

// const RegisterSchema = new mongoose.Schema(
//   {
//     userId:{
//       type:String
//     },

//     conversations:[messagesSchema]
//   },{timestamps:true}
// );

// const conversationSchema = new mongoose.Schema(
//   {
//     userId:{
//       type:String
//     },
//     register:[RegisterSchema]
//   }
// );

module.exports = mongoose.model('messages',messagesSchema)
// module.exports = mongoose.model("conversations", conversationSchema);
