const express = require('express');
const mongo = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017/';
const bodyparser = require('body-parser');
const path = require('path');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
//const cookieparser = require('cookie-parser');

const app = express();

app.use(express.static(__dirname + '/template'));
app.use(bodyparser.urlencoded({extended:false}));
//app.use(cookieparser());
app.use(require('express-session')({ secret: 'asuhibcscjnao', resave: true, saveUninitialized: true}));
app.use(passport.initialize());
app.use(passport.session());
app.set("view engine","ejs");
app.listen(3000);

mongo.connect(url, function(err, db){
	var dbo = db.db("LoginDetails");
	dbo.createCollection("Boss").insertOne({name:"Yuvraj", username:"admin", password:"admin", boss:true});
	var dbo2 = db.db("MainDB");
	dbo2.createCollection("Boss").insertOne({"name" : "Yuvraj", "username" : "admin", "designation" : "Boss", "phone" : "3444261", "mobile" : "8968285950", "email" : "yuvrajg@iitk.ac.in", "gender" : "Male", "address" : "Jalandhar", "nationality" : "India", "dob" : "16/11/1999", "adhaar" : "23213432", "account" : "23124253", "joining" : "16/11/1999", "marital" : "Unmarried"})
	dbo2.createCollection("Announcements").insertOne({date:"", announcement:"Announcement 1",date:"", announcement:"Announcement 2",date:"", announcement:"Announcement 3"});
	dbo2.createCollection("Messages")
});