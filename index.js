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
			dbo.collection("Employees").SfindOne({username: req.user.username}, function(err, doc){
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

app.post("/changePasswordBoss", function(req,res){
	if(req.body.newpassword != req.body.retypepassword){
		res.redirect("/boss/" + req.user.username + "/profile/changePassword");
	}
	else if(req.body.newpassword == req.body.retypepassword){
		mongo.connect(url, function(err, db){
			var dbo = db.db("LoginDetails");
			dbo.collection("Boss").findOne({username: req.user.username}, function(err, doc){
				if(err) throw err;
				if(doc.password == req.body.oldpassword){
					var myQuery = {username: doc.username};
					dbo.collection("Boss").remove(myQuery);
					dbo.collection("Boss").insertOne({name: req.user.name, username: req.user.username, password: req.body.newpassword, boss:true},function(err,result){});
					res.redirect("/boss/" + req.user.username + "/profile");
				}
				else{
					res.redirect("/boss/" + req.user.username + "/profile/changePassword");
				}
			});	
		});
	}
});

app.post("/chatAppend", function(req, res){
	console.log(req.body)
	mongo.connect(url, function(err, db){
		var dbo = db.db("MainDB");
		dbo.collection("Messages").insertOne({name: req.session.passport.user.name, time: new Date(), message: req.body.message}, function(err, result){});
	});
});

// app.post("/todoPostBoss", function(req, res){
// 	mongo.connect(url, function(err, db){
// 		var dbo = db.db("MainDB");
// 		dbo.collection("Boss").findOne({name: req.session.passport.user.name}, function(err, doc){
// 			if(err) throw err;
// 			var myQuery = {name: req.session.passport.user.name};
// 			dbo.collection("Boss").remove(myQuery);
// 			doc.todo.push(req.body.todo);
// 			dbo.collection("Boss").insertOne(doc);
// 		});
// 	});
// });

// app.post("/todoDonePostBoss", function(req, res){
// 	mongo.connect(url, function(err, db){
// 		var dbo = db.db("MainDB");
// 		dbo.collection("Boss").findOne({name: req.session.passport.user.name}, function(err, doc){
// 			if(err) throw err;
// 			var myQuery = {name: req.session.passport.user.name};
// 			dbo.collection("Boss").remove(myQuery);

// 			doc.todoDone.push(req.body.todoDone);
// 			dbo.collection("Boss").insertOne(doc);
// 		});
// 	});
// });

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
				dbo.collection("Messages").find().toArray(function(err, result){
					var Messages = [];
					for(var i=0; i<result.length; i++){
						Messages.push(result[i]);
					}
					if(req.params.type == "employees" && typeof req.session.passport.user.boss === "undefined"){
						dbo.collection("Employees").findOne({username: req.session.passport.user.username}, function(err, doc){
							if(err) throw err;
							if(doc){
								res.render("employee", {name: req.session.passport.user.name, username: req.session.passport.user.username, announcements: Announcements, messages: Messages, todoList: doc.todo, todoDoneList: doc.todoDone});
							}
						});
					}
					else if(req.params.type == "boss" && req.session.passport.user.boss == true){
						dbo.collection("Boss").findOne({username: req.session.passport.user.username}, function(err, doc){
							if(err) throw err;
							if(doc){
								res.render("boss", {name: req.session.passport.user.name, username: req.session.passport.user.username, announcements: Announcements, messages: Messages, todoList: doc.todo, todoDoneList: doc.todoDone});
							}
						});
					}
				});
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
			mongo.connect(url,function(err,db){
				var dbo = db.db("MainDB");
				dbo.collection("Boss").findOne({username: req.session.passport.user.username}, function(err,doc){
					if(err) throw err;
					res.render("profileBoss", doc);
				});
			});
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
.get("/:type/:username/profile/changePassword", function(req,res){
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
			res.sendFile("/template/changepass.html", {root:__dirname});
		}	
		else if(req.params.type == "boss" && req.session.passport.user.boss == true){
			res.sendFile("/template/changepassB.html", {root:__dirname});
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

app.post("/boss/:username/profile/update", function(req, res){
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
			dbo.collection("Boss").findOne({username: req.params.username}, function(err, doc){
				var myQuery = {username: req.params.username};
				dbo.collection("Boss").remove(myQuery);
				dbo.collection("Boss").insertOne(req.body,function(err,result){});
			});
			var dbo2 = db.db("LoginDetails");
			dbo2.collection("Boss").findOne({username: req.params.username}, function(err, doc){
				var myQuery = {username: req.params.username};
				dbo2.collection("Boss").remove(myQuery);
				dbo2.collection("Boss").insertOne({name: req.body.name, username: req.body.username, password: doc.password}, function(err, doc){})
				res.redirect("/boss/" + req.params.username + "/profile");
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