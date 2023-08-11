const express = require('express')
require('dotenv').config();
const app = express()
const bcrypt = require('bcrypt');
const morgan = require("morgan");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
var cors = require('cors');
var jwt = require('jsonwebtoken');
app.use(cors());
app.use(express.json());
const middleware = require("./middleware/middleware")

const port = 5010
//////connect db file
require("./db/config")
/////////register model connect/////////////
const schema = require("./Model/register");

////////api/////////

app.post('/registerHere',
  middleware.validateUser
  , async (req, res) => {
    const { name, email, password, conpassword } = req.body
    const register = await schema.Register.findOne({ email: email });
    if (register && register._id) {
      res.status(400).json({
        success: false,
        message: "user already exist",
        result: ""
      })
    }
    else {
      let user = await schema.Register.create({
        name: name,
        email: email,
        password: password,
        conpassword: conpassword
      })
      res.status(200).json({
        success: true,
        message: "Register succesfull",
        result: user
      })
    }

  })

/////////login////////

app.post('/login', async (req, res, next) => {
  console.log('login api hit', req.body)
  const { email, password } = req.body;
  if (email && password) {
    const user = await schema.Register.findOne({ email: email });
    console.log(user)
    if (user && user._id) {
      bcrypt.compare(password, user.password).then(async match => {
        if (match) {
          let token = await jwt.sign({ user: user }, process.env.SECREAT_KEY, { expiresIn: "24h" })
          res.status(200).json({
            success: true,
            message: "login successfull",
            result: {
              user: user,
              jwt: token
            }
          })
        }
        else {
          res.status(400).json({
            success: false,
            message: "password incorect"
          })
        }
      })
    }
    else {
      res.json({ "user": "user" })
    }
  } else {
    res.status(400).send({
      success: false,
    });
  }

});

//////////verify /////////////

app.get('/verify', middleware.validateToken, (req, res, next) => {
  console.log('verify api hit')
  res.status(200).json({
    "success": true,
    "message": "welcome",
    "result": ""

  })
})
/////// Password Update/////

app.post('/updatePassword',
  middleware.validateRegUser,
  async (req, res, next) => {
    console.log("Update Password api Hit")
    let otp = await schema.Otp.findOne({otp:req.body.otp, email:req.body.email});
    if(otp){
    let currentTime = new Date();
    let storedTime = otp.date;
    let timeDifference = (currentTime - storedTime) / (1000 * 60);

    if (timeDifference < 10 ) {
      const regUser = await schema.Register.findOneAndUpdate({ email: req.body.email }, { $set: { password: req.body.password, conpassword: req.body.conpassword } }, { new: true });
      // console.log(regUser);
      if (!regUser) {
        return res.status(400).json({
          sucess: false,
          message: "User not registered"
        })
      }
      else {
        res.status(200).json({
          success: true,
          message: "new password updated",
          result: regUser
        })
      }
      
    } else {
      res.json({ message: 'OTP has expired' });
    }
  }else{
    res.json("invalid OTP");
  }
})

  //////otp send/////

app.post('/sendOtp', async(req,res,next)=>{
  const email = req.body.email
  const regUser = await schema.Register.findOne({ email:email });
  if (!regUser){
    res.status(400).json({
      success: false,
      message: "user do not exist",
      result: ""
    })
  } else{
  let newOtp = Math.floor( (Math.random() + 1)*100000);
  let otp = await schema.Otp.create({
     email:email,
     otp:newOtp
    })
 const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'nkb.coder@gmail.com',
        pass: 'password'
      }
    });
    async function main() {
      
      const info = await transporter.sendMail({
        from: 'nkb.coder@gmail.com', 
        to: `${email}`,
        subject: "OTP", 
        html:`<b>Hello your OTP id ${newOtp}</b>`, 
      });
      // console.log("Message sent", info.messageId);
    }

    main().catch(console.error);

    res.status(200).json({
      success: true,
      message: "OTP Sent",
      result: {}
    })
  } 
});




app.listen(port, () => {
  console.log(`server is running on port ${port}`)
  console.log(`http://localhost:${port}`)
});



// const express = require('express');
// const app = express();
// app.use(express.json());
// const port = 5000;

// //////connect db file
// require("./db/connectdb")
// /////////register model connect/////////////
// const schema=require("./Model/schema")

// ////////// state api///////

// ///////create////////

// app.post('/create', async (req,res)=>{
//   const {name, code ,cities,book,author } = req.body;
//   // const rajya = await schema.Rajya.find({name:name});
//         let user=await schema.Rajya.create({
//             name:name,
//             code:code,
//             cities: cities,
//             book :book,
//             author:author
//           });
//         res.status(200).json({
//             success:true,
//             message:"Data created succesfull",
//             result: user
//           });
// });

// ///////read//////

// app.get('/read', async (req,res)=>{
//   const {name } = req.body;
//   const rajya = await schema.Rajya.findOne({name:name});
//   await rajya.populate([
//     {
//     path:'cities',
//     select: '-_id ',
//     populate: {
//       path:'states',
//       select: '-_id -cities'
//     }
//      },
//       {
//       path : 'book',
//       select: '-_id'
//     },
//       {
//       path : 'author',
//       select: '-_id'
//     }
//     ]);

// console.log(rajya)
//   if(!rajya){
//     return res.status(400).json({
//       sucess:false,
//       message: "Data not Found"
//     })
//   }
//   else{
//     res.status(200).json({
//       success: true,
//       result: rajya
//     })
//   }
// });

// //////update///////

// app.post('/update',async(req,res)=>{
//   const {_id, name, code,cities, book, author} = req.body;
//   const rajya = await schema.Rajya.findOneAndUpdate({_id:_id},{$set:{name:name,code:code,cities:cities,book:book,author:author}},{new:true});
//   console.log(rajya);
//   if(!rajya){
//     return res.status(400).json({
//       sucess:false,
//       message: "Data not Found"
//     })
//   }
//   else{
//     res.status(200).json({
//       success:true,
//       message:"data updated",
//       result: rajya
//     })
//   }
// })

// ////////delete///////

// app.post('/delete',async(req,res)=>{
//   const {_id, name, code} = req.body;
//   const rajya = await schema.Rajya.findOneAndRemove({_id:_id});
//   console.log(rajya);
//   if(!rajya){
//     return res.status(400).json({
//       sucess:false,
//       message: "Data not Found"
//     })
//   }
//   else{
//     res.status(200).json({
//       success:true,
//       message:"data Deleted"
//     })
//   }
// });


// ///////////cities api////////

// ///////create cities////////

// app.post('/createCity', async (req,res)=>{
//   const {name, pincode,states} = req.body;
//   // const cities = await schema.City.find({name:name});
//         let user=await schema.City.create({
//             name:name,
//             pincode:pincode,
//             states: states
//           });
//         res.status(200).json({
//             success:true,
//             message:"Data created succesfull",
//             result: user
//           });
// });

// ///////read cities//////

// app.get('/readCity', async (req,res)=>{
//   const {name, pincode, states } = req.body;
//   // const cities = await schema.City.findOne({name:name});
//   // await cities.populate([{
//   //   path:'states',
//   //   match: { states },
//   //   select: '-_id -cities'
//   //   // transform:states => states==null? null: states.name
//   //   // transform: (states) =>{
//   //   //   if(states==null){
//   //   //     return null;
//   //   //   }else{
//   //   //     return {
//   //   //       name: states.name,
//   //   //       code: states.code
//   //   //     }
//   //   //   }
//   //   // }
//   //    }
//   //   ]);
//  const cities = await schema.City.aggregate([
//    {
//     $match:{name:name}
//    },
//    {
//     $lookup: {
//       from : 'states',
//       localField:'states',
//       foreignField:'_id',
//       pipeline: [{
//         $project:{
//         _id:0,
//         cities:0,
//         book:0,
//         author:0,
//         createdAt:0,
//         updatedAt:0
//         }
//       }],
//       as:'states'
//     }
//    }
//   ])
//   console.log(cities);
//   if(!cities){
//     return res.status(400).json({
//       sucess:false,
//       message: "Data not Found"
//     })
//   }
//   else{
//     res.status(200).json({
//       success: true,
//       result: cities
//     })
//   }
// });

// //////update cities///////

// app.post('/updateCity',async(req,res)=>{
//   const {_id, name, pincode,states} = req.body;
//   const cities = await schema.City.findOneAndUpdate({_id:_id},{$set:{name:name,pincode:pincode,states:states}},{new:true});
//   console.log(cities);
//   if(!cities){
//     return res.status(400).json({
//       sucess:false,
//       message: "Data not Found"
//     })
//   }
//   else{
//     res.status(200).json({
//       success:true,
//       message:"data updated",
//       result: cities
//     })
//   }
// })

// ////////delete cities///////

// app.post('/deleteCity',async(req,res)=>{
//   const {_id, name, code} = req.body;
//   const cities = await schema.City.findOneAndRemove({_id:_id});
//   console.log(cities);
//   if(!cities){
//     return res.status(400).json({
//       sucess:false,
//       message: "Data not Found"
//     })
//   }
//   else{
//     res.status(200).json({
//       success:true,
//       message:"data Deleted"
//     })
//   }
// });



// app.listen(port, () => {
//     console.log(`server is running on port ${port}`)
//     console.log(`http://localhost:${port}`)
//   });

