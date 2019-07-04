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

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

passport.use('Employee',new LocalStrategy(function(username, password, done){
	mongo.connect(url,function(err, db){
		var dbo = db.db("LoginDetails");
		dbo.collection("Employees").findOne({username: username}, function(err, user){
	        if (err) {
	        	return done(err);
	        }
	        if (!user) {
	        	return done(null, false,{message: "User does not exist!"});
	        }
	        if (user.password != password) {
	        	return done(null, false, {message: "Incorrect password!"});
	        }
	        return done(null, user);
	    });
	});
}));

passport.use('Boss', new LocalStrategy(function(username, password, done){
	mongo.connect(url, function(err, db){
		var dbo = db.db("LoginDetails");
		dbo.collection("Boss").findOne({username: username}, function(err, user){
	    	if (err) {
	        	return done(err);
	        }
	        if (!user) {
	        	return done(null, false,{message: "User does not exist!"});
	        }
	        if (user.password != password) {
	        	return done(null, false, {message: "Incorrect password!"});
	        }
	        return done(null, user);
	    });
	});
}));

app.use(function(req,res,next) {
  res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  next();
})
.get("/",function(req,res){
	if(typeof req.session.passport === "undefined"){
		res.sendFile("template/login.html",{root:__dirname});
	}
	else if(typeof req.session.passport.user === "undefined"){
		res.sendFile("template/login.html",{root:__dirname});
	}
	else{
		if(typeof req.session.passport.user.boss === "undefined"){
			res.redirect("/employees/" + req.session.passport.user.username);	
		}
		else if(req.session.passport.user.boss){
			res.redirect("/boss/" + req.session.passport.user.username);
		}	
	}
});

app.post("/loginEmployee", passport.authenticate('Employee', {failureRedirect: "/"}),function(req,res){
	res.redirect("/employees/" + req.user.username);
});

app.post("/loginBoss", passport.authenticate('Boss', {failureRedirect: "/"}),function(req,res){
	res.redirect("/boss/" + req.user.username);
});

app.post("/changePassword", function(req,res){
	if(req.body.newpassword != req.body.retypepassword){
		res.redirect("/employees/" + req.user.username + "/profile/changePassword");
	}
	else if(req.body.newpassword == req.body.retypepassword){
		mongo.connect(url, function(err, db){
			var dbo = db.db("LoginDetails");
			dbo.collection("Employees").findOne({username: req.user.username}, function(err, doc){
				if(err) throw err;
				if(doc.password == req.body.oldpassword){
					var myQuery = {username: doc.username};
					dbo.collection("Employees").remove(myQuery);
					dbo.collection("Employees").insertOne({name: req.user.name, username: req.user.username, password: req.body.newpassword},function(err,result){});
					res.redirect("/employees/" + req.user.username + "/profile");
				}
				else{
					res.redirect("/employees/" + req.user.username + "/profile/changePassword");
				}
			});	
		});
	}
});

app.use(function(req,res,next) {
  res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  next();
})
.get("/:type/:username", function(req,res){
	if(typeof req.session.passport === "undefined"){
		res.sendFile("/template/error.html",{root:__dirname});
	}
	else if(typeof req.session.passport.user === "undefined"){
		res.sendFile("/template/error.html",{root:__dirname});	
	}
	else if(req.session.passport.user.username != req.params.username){
		res.sendFile("/template/error.html",{root:__dirname});
	}
	else if(req.session.passport.user.username == req.params.username){
		mongo.connect(url, function(err,db){
			var dbo = db.db("MainDB");
			dbo.collection("Announcements").find().toArray(function(err, result){
				var Announcements = [];
				for(var i=result.length - 1; i>=0; i--){
					Announcements.push({date: result[i].date,announcement: result[i].announcement})
				}
				if(result.length > 5){
					if(req.params.type == "employees" && typeof req.session.passport.user.boss === "undefined")
					res.render("employee", {username: req.session.passport.user.username, announcements: Announcements, iter: 5});
					else if(req.params.type == "boss" && req.session.passport.user.boss == true)
					res.render("boss", {username: req.session.passport.user.username, announcements: Announcements, iter: 5});
				}
				else if(result.length <= 5){
					if(req.params.type == "employees" && typeof req.session.passport.user.boss === "undefined")
					res.render("employee", {username: req.session.passport.user.username, announcements: Announcements, iter: 5});
					else if(req.params.type == "boss" && req.session.passport.user.boss == true)
					res.render("boss", {username: req.session.passport.user.username, announcements: Announcements, iter: 5});
				}
			});
		});
	}
	else{
		res.sendFile("/template/error.html",{root:__dirname});	
	}
});

app.use(function(req,res,next) {
  res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  next();
})
.get("/:type/:username/profile", function(req,res){
	if(typeof req.session.passport === "undefined"){
		res.sendFile("/template/error.html",{root:__dirname});
	}
	else if(typeof req.session.passport.user === "undefined"){
		res.sendFile("/template/error.html",{root:__dirname});	
	}
	else if(req.session.passport.user.username != req.params.username){
		res.sendFile("/template/error.html",{root:__dirname});
	}
	else if(req.session.passport.user.username == req.params.username){
		if(req.params.type == "employees" && typeof req.session.passport.user.boss === "undefined"){
			mongo.connect(url,function(err,db){
				var dbo = db.db("MainDB");
				dbo.collection("Employees").findOne({username: req.session.passport.user.username}, function(err,doc){
					if(err) throw err;
					res.render("profile", doc);
				});
			});
		}	
		else if(req.params.type == "boss" && req.session.passport.user.boss == true){
			
		}
	}
	else{
		res.sendFile("/template/error.html",{root:__dirname});	
	}
});

app.use(function(req,res,next) {
  res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  next();
})
.get("/:type/:username/contacts", function(req,res){
	if(typeof req.session.passport === "undefined"){
		res.sendFile("/template/error.html",{root:__dirname});
	}
	else if(typeof req.session.passport.user === "undefined"){
		res.sendFile("/template/error.html",{root:__dirname});	
	}
	else if(req.session.passport.user.username != req.params.username){
		res.sendFile("/template/error.html",{root:__dirname});
	}
	else if(req.session.passport.user.username == req.params.username){
		mongo.connect(url,function(err,db){
			var dbo = db.db("MainDB");
			dbo.collection("Employees").find().toArray(function(err,result){
				var EmployeesArr = [];
				for(var i=0; i<result.length; i++){
					EmployeesArr.push({name: result[i].name, designation: result[i].designation, phone: result[i].phone, mobile: result[i].mobile, email: result[i].email, username: result[i].username});
				}
				if(req.params.type == "employees" && typeof req.session.passport.user.boss === "undefined")
				res.render("contact",{employees: EmployeesArr, username: req.session.passport.user.username});
				else if(req.params.type == "boss" && req.session.passport.user.boss == true)
				res.render("contactB",{employees: EmployeesArr, username: req.session.passport.user.username});
			});
		});	
	}
	else{
		res.sendFile("/template/error.html",{root:__dirname});	
	}
});

app.use(function(req,res,next) {
  res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  next();
})
.get("/boss/:username/contacts/:emp_username", function(req,res){
	if(typeof req.session.passport === "undefined"){
		res.sendFile("/template/error.html",{root:__dirname});
	}
	else if(typeof req.session.passport.user === "undefined"){
		res.sendFile("/template/error.html",{root:__dirname});	
	}
	else if(req.session.passport.user.username != req.params.username){
		res.sendFile("/template/error.html",{root:__dirname});
	}
	else if(req.session.passport.user.username == req.params.username && req.session.passport.user.boss == true){	
		mongo.connect(url,function(err,db){
			var dbo = db.db("MainDB");
			dbo.collection("Employees").findOne({username: req.params.emp_username}, function(err,doc){
				if(err) throw err;
				if(doc){
					var upd_doc = doc;
					upd_doc.boss_user = req.params.username
					res.render("profileB", upd_doc);
				}
			});
		});
	}
	else{
		res.sendFile("/template/error.html",{root:__dirname});	
	}
});

app.post("/boss/:username/contacts/:emp_username/update", function(req,res){
	if(typeof req.session.passport === "undefined"){
		res.sendFile("/template/error.html",{root:__dirname});
	}
	else if(typeof req.session.passport.user === "undefined"){
		res.sendFile("/template/error.html",{root:__dirname});	
	}
	else if(req.session.passport.user.username != req.params.username){
		res.sendFile("/template/error.html",{root:__dirname});
	}
	else if(req.session.passport.user.username == req.params.username && req.session.passport.user.boss == true){	
		mongo.connect(url,function(err,db){
			var dbo = db.db("MainDB");
			dbo.collection("Employees").findOne({username: req.params.emp_username}, function(err, doc){
				var myQuery = {username: req.params.emp_username};
				dbo.collection("Employees").remove(myQuery);
				dbo.collection("Employees").insertOne(req.body,function(err,result){});
			});
			var dbo2 = db.db("LoginDetails");
			dbo2.collection("Employees").findOne({username: req.params.emp_username}, function(err, doc){
				var myQuery = {username: req.params.emp_username};
				dbo2.collection("Employees").remove(myQuery);
				dbo2.collection("Employees").insertOne({name: req.body.name, username: req.body.username, password: doc.password}, function(err, doc){})
				res.redirect("/boss/" + req.params.username + "/contacts/" + req.body.username);
			});
		});
	}
	else{
		res.sendFile("/template/error.html",{root:__dirname});	
	}
});

app.get("/logout", function(req,res){
	req.logout();
	res.redirect("/");
});

console.log("Listening on port 3000");

//use cookie