// const passport = require('passport');
// const LocalStrategy = require('passport-local').Strategy;
// const User = require("./models/user");
// const JwtStrategy = require('passport-jwt').Strategy;
// const Extractjwt = require('passport-jwt').ExtractJwt;
// const jwt = require('jsonwebtoken');
// const config = require('./config.js');

// passport.use(new LocalStrategy(User.authenticate()));
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

// exports.getToken = function(user){
//   return jwt.sign(user, config.secretKey,
//     {expiresIn:3600});
// };

// var opts = {};
// opts.jwtFromRequest = Extractjwt.fromAuthHeaderAsBearerToken();
// opts.secretOrKey = config.secretKey;

// exports.jwtPassport = passport.use(new JwtStrategy(opts,(jwt_payload,done)=>
// {
//   console.log("JWT payload: ", jwt_payload);

//   User.findOne({_id: jwt_payload._id},(err,user)=>{
//     console.log(user,jwt_payload._id)
//     if(err)
//       return done(err,false);
//     else if (user)
//       return done(null,user);
//     else
//       return done(null,false);
    
//   })
// }))
// exports.verifyUser = passport.authenticate('jwt',{session:false});

// var passport = require('passport');
// var LocalStrategy = require('passport-local').Strategy;
// var User = require('./models/user');
// var JwtStrategy = require('passport-jwt').Strategy;
// var ExtractJwt = require('passport-jwt').ExtractJwt;
// var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens

// var config = require('./config.js');
// passport.use(new LocalStrategy(User.authenticate()));
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

// exports.getToken = function(user) {
//   return jwt.sign(user, config.secretKey,
//       {expiresIn: 3600});
// };

// var opts = {};
// opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
// opts.secretOrKey = config.secretKey;

// exports.jwtPassport = passport.use(new JwtStrategy(opts,
//   (jwt_payload, done) => {
//       console.log("JWT payload: ", jwt_payload);
//       User.findOne({_id: jwt_payload._id}, (err, user) => {
//           if (err) {
//               return done(err, false);
//           }
//           else if (user) {
//               return done(null, user);
//           }
//           else {
//               return done(null, false);
//           }
//       });
//   }));
const {OAuth2Client} = require('google-auth-library');
CLIENT_ID=process.env.CLIENT_ID

const client = new OAuth2Client(CLIENT_ID);
 async function verify(token) {
  const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
  });
  const payload = ticket.getPayload();
  const userid = payload['sub'];
  return userid;
}
module.exports = verify;