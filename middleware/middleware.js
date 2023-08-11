require('dotenv').config();
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
module.exports={
     validateUser:async(req,res,next)=>{
        const { name, email, password, conpassword } = req.body
        await checkEmptyData(req.body,res,"name", "email", "password", "conpassword")
        if(password===conpassword){
            const hashPassword = await bcrypt.hash(password, 10);
            const hashConPassword = await bcrypt.hash(conpassword, 10);
            req.body.password=hashPassword
            req.body.conpassword=hashConPassword
            next()
        }
        else{
            res.status(400).json({
                success:false,
                message:"password and confirm password should match",
                result:""
              })
        }
        
      },
      validateRegUser:async(req,res,next)=>{
        const { email, password, conpassword } = req.body
        await checkEmptyData(req.body,res,"email", "password", "conpassword")
        if(password===conpassword){
            const hashPassword = await bcrypt.hash(password, 10);
            const hashConPassword = await bcrypt.hash(conpassword, 10);
            req.body.password=hashPassword
            req.body.conpassword=hashConPassword
            next()
        }
        else{
            res.status(400).json({
                success:false,
                message:"password and confirm password should match",
                result:""
              })
        }
        
      },

      validateToken:async(req,res,next)=>{
        const bearerHeader = req.headers['authorization'];
        let token=''
        if(typeof bearerHeader !== 'undefined'){
          const bearer = bearerHeader.split(' ');
           token = bearer[1];

        }
        let userAuth=await jwt.verify(token,process.env.SECREAT_KEY,(err, decoded)=>{
         if(err){
          console.log(err)
           res.json({message:"not authorised"})
         }
         else{
           next()
         }
        })
      }
}

let checkEmptyData=async(body,res,...elm)=>{
    console.log(elm)
    elm.map(item=>{
        console.log(body[item])
      if( body[item]===undefined ||body[item]===null || body[item]===""){
        res.status(400).json({
          success:false,
          message:`${item} is required`,
          result:""
        })
      }
    })
  }