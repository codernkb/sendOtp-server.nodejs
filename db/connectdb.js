const mongoose = require('mongoose');

var db1name=mongoose.createConnection('mongodb://127.0.0.1:27017/AAA2')

var db2name= mongoose.createConnection('mongodb://127.0.0.1:27017/AAA')


module.exports={db1name:db1name,db2name:db2name} ;
