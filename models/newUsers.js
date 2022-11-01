const mongoose = require("mongoose");

const newUserSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
    },
    username:{
        type: String,
    },
    profilePicture:{
        type:String,
    }
  },
  
);

module.exports = mongoose.model("newusers", newUserSchema);