const express = require('express');
const createError = require('http-errors');
const path = require('path');
const cookieParser = require('cookie-parser');
const app = express();
const passport = require('passport');
const authenticate = require('./authenticate');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const morgan = require('morgan');
const bodyParser = require('body-parser')

const cors = require('cors')
const config = require('./config');
const index = require('./routes/index');
const auth = require('./routes/auth');
const user = require('./routes/users')
const post =  require('./routes/posts');
const chats =  require('./routes/chats');
const PORT = process.env.PORT || 8000;

// const url = config.mongoUrl
const url = process.env.MONGO_URL
dotenv.config();
mongoose.connect(
  url,
  {useNewUrlParser: true, useUnifiedTopology: true}
).then(()=>{
  console.log('connected correctly to the server');
}).catch((err)=>console.log(err)),(err)=>{console.log(err);}

app.use(express.json())
app.use(express.urlencoded({ extended: false})) 

app.use(morgan('dev'))
app.use(cors())

app.use(cookieParser(config.secretKey))
// app.use(passport.initialize())
// app.use(passport.session())
app.use('/',index)
app.use('/user',user)
app.use('/auth',auth)
app.use('/chats',chats)
app.use('/posts',post)

// function authe(req,res,next){
//   if(!req.user){
//     var err = new Error("you are not authenticated");
//     err.status = 403;
//     return next(err);
//   }
//   else{
//     next();
//   }
// }
// app.use(authe)
app.use((req, res, next) => {
  next(createError(404));
});
app.listen(PORT,()=>{
  console.log("running...");
})
module.exports = app;