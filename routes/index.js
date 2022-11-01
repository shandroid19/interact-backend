const express = require('express');
const router = express.Router();


/* GET home page. */
router.get('/', (req, res, next) => {
  res.send('<h1>Welcome to the MERN Stack</h1>');
});
router.post('/',(req,res,next)=>{
    // res.statuscode = 200;
    // res.setHeader('Content-Type','application/json')
    // res.json({success: true, status: 'registration successful'})
    // console.log(req)
    res.send(req.body)
})


module.exports = router;