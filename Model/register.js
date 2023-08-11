const mongoose = require('mongoose');

const registerSchema = new mongoose.Schema({
  name: {type:String}, 
  email: {type:String},
  password: {type:String},
  conpassword:{type:String},
});

const otpSchema = new mongoose.Schema({
  otp:{type:Number,unique:true},
  email: {type:String},
  date: { type: Date, default: Date.now }
})

const Otp = mongoose.model("Otps",otpSchema)
const Register=mongoose.model("Registers",registerSchema)
module.exports={Register:Register,Otp:Otp}