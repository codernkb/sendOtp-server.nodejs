const mongoose = require('mongoose');
const { db1name, db2name } = require('../db/connectdb');


const bookSchema = new mongoose.Schema({
    name  : {type:String,required:true,unique:true},
    genere : {type:String,required:true,unique:true},
},{timestamps:true});

const Book = db1name.model('Books', bookSchema);

const authorSchema = new mongoose.Schema({
    name  : {type:String,required:true,unique:true},
    mobile : {type:String,required:true,unique:true},
},);


const Author = db1name.model('Authors', authorSchema);


const {ObjectId}=mongoose.Schema
const stateSchema = new mongoose.Schema({
     name : {type:String, required:true,unique:true},
     code : {type:String, required:true,unique:true},
     cities: {type:ObjectId, ref:'Cities',required:true},
     book: {type:ObjectId,ref:Book,required:true},
     author: {type:ObjectId,ref:Author,required:true}
},{timestamps:true});

const Rajya = db2name.model('States', stateSchema);

const citySchema = new mongoose.Schema({
    name  : {type:String,required:true,unique:true},
    pincode : {type:String,required:true,unique:true},
    states : {type:ObjectId, ref:'States',required:true}
},{timestamps:{ createdAt: true, updatedAt: false }});

const City = db2name.model('Cities', citySchema);



module.exports = {Rajya:Rajya,City:City,Book:Book,Author:Author};

