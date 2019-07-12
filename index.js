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

function deleteDone(Arr, str){
	for(var i=0; i<Arr.length; i++){
		if(Arr[i].trim() === str.trim()){
			Arr.splice(i,1);
			break;
		}
	}
	return Arr;
}

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
		//alert
		res.redirect("/employees/" + req.user.username + "/profile/changePassword");
	}
	else if(req.body.newpassword == req.body.retypepassword){
		//alert
		mongo.connect(url, function(err, db){
			var dbo = db.db("LoginDetails");
			dbo.collection("Employees").SfindOne({username: req.user.username}, function(err, doc){
				if(err) throw err;
				if(doc.password == req.body.oldpassword){
					var myQuery = {username: doc.username};
					var newValues = {$set: {password: req.body.newpassword}}
					dbo.collection("Employees").updateOne(myQuery, newValues);
					res.redirect("/employees/" + req.user.username + "/profile");
				}
				else{
					//alert
					res.redirect("/employees/" + req.user.username + "/profile/changePassword");
				}
			});	
		});
	}
});

app.post("/changePasswordBoss", function(req,res){
	if(req.body.newpassword != req.body.retypepassword){
		//alert
		res.redirect("/boss/" + req.user.username + "/profile/changePassword");
	}
	else if(req.body.newpassword == req.body.retypepassword){
		//alert
		mongo.connect(url, function(err, db){
			var dbo = db.db("LoginDetails");
			dbo.collection("Boss").findOne({username: req.user.username}, function(err, doc){
				if(err) throw err;
				if(doc.password == req.body.oldpassword){
					var myQuery = {username: doc.username};
					var newValues = {$set: {password: req.body.newpassword}};
					dbo.collection("Boss").updateOne(myQuery, newValues);
					res.redirect("/boss/" + req.user.username + "/profile");
				}
				else{
					//alert
					res.redirect("/boss/" + req.user.username + "/profile/changePassword");
				}
			});	
		});
	}
});

app.post("/addAnnouncement", function(req, res){
	if(typeof req.session.passport === "undefined"){
		res.sendFile("/template/error.html",{root:__dirname});
	}
	else if(typeof req.session.passport.user === "undefined"){
		res.sendFile("/template/error.html",{root:__dirname});	
	}
	else if(typeof req.session.passport.user.boss === "undefined"){
		res.sendFile("/template/error.html",{root:__dirname});	
	}
	else if(req.session.passport.user.boss == true){	
		mongo.connect(url, function(err, db){
			var dbo = db.db("MainDB");
			dbo.collection("Announcements").insertOne({id: new Date().getTime().toString(),date: new Date().toString().substr(new Date().toString(), new Date().toString().length - 18), announcement: req.body.announcement});
			res.redirect("/");
		});
	}
	else{
		res.sendFile("/template/error.html",{root:__dirname});	
	}
});

app.post("/deleteAnnouncement", function(req, res){
	if(typeof req.session.passport === "undefined"){
		res.sendFile("/template/error.html",{root:__dirname});
	}
	else if(typeof req.session.passport.user === "undefined"){
		res.sendFile("/template/error.html",{root:__dirname});	
	}
	else if(typeof req.session.passport.user.boss === "undefined"){
		res.sendFile("/template/error.html",{root:__dirname});
	}
	else if(req.session.passport.user.boss == true){	
		mongo.connect(url,function(err,db){
			var dbo = db.db("MainDB");
			dbo.collection("Announcements").remove({id: req.body.id});
			res.redirect("/");
		});
	}
	else{
		res.sendFile("/template/error.html",{root:__dirname});	
	}
});

app.post("/chatAppend", function(req, res){
	if(typeof req.session.passport === "undefined"){
		res.sendFile("/template/error.html",{root:__dirname});
	}
	else if(typeof req.session.passport.user === "undefined"){
		res.sendFile("/template/error.html",{root:__dirname});	
	}
	else if(req.session.passport.user){	
		mongo.connect(url, function(err, db){
			var dbo = db.db("MainDB");
			dbo.collection("Messages").insertOne({name: req.session.passport.user.name, time: new Date().toString().substr(new Date().toString(), new Date().toString().length - 18), message: req.body.message}, function(err, result){});
		});
	}
	else{
		res.sendFile("/template/error.html",{root:__dirname});	
	}
});

app.get("/refreshAnnouncements", function(req, res){
	if(typeof req.session.passport === "undefined"){
		res.sendFile("/template/error.html",{root:__dirname});
	}
	else if(typeof req.session.passport.user === "undefined"){
		res.sendFile("/template/error.html",{root:__dirname});	
	}
	else if(req.session.passport.user){	
		mongo.connect(url, function(err, db){
			var dbo = db.db("MainDB");
			dbo.collection("Announcements").find().toArray(function(err, result){
				res.json(result);
			});
		});
	}
	else{
		res.sendFile("/template/error.html",{root:__dirname});	
	}
});

app.get("/refreshMessages", function(req, res){
	if(typeof req.session.passport === "undefined"){
		res.sendFile("/template/error.html",{root:__dirname});
	}
	else if(typeof req.session.passport.user === "undefined"){
		res.sendFile("/template/error.html",{root:__dirname});	
	}
	else if(req.session.passport.user){	
		mongo.connect(url, function(err, db){
			var dbo = db.db("MainDB");
			dbo.collection("Messages").find().toArray(function(err, result){
				var Arr = result
				Arr.push({name: req.session.passport.user.name});
				res.json(Arr);
			});
		});
	}
	else{
		res.sendFile("/template/error.html",{root:__dirname});	
	}
});

app.post("/todoPostBoss", function(req, res){
	if(typeof req.session.passport === "undefined"){
		res.sendFile("/template/error.html",{root:__dirname});
	}
	else if(typeof req.session.passport.user === "undefined"){
		res.sendFile("/template/error.html",{root:__dirname});	
	}
	else if(typeof req.session.passport.user.boss === "undefined"){
		res.sendFile("/template/error.html",{root:__dirname});	
	}
	else if(req.session.passport.user.boss == true){	
		mongo.connect(url, function(err, db){
			var dbo = db.db("MainDB");
			dbo.collection("Boss").findOne({name: req.session.passport.user.name}, function(err, doc){
				if(err) throw err;
				var myQuery = {name: req.session.passport.user.name};
				var Arr = doc.todo;
				Arr.push(req.body.todo);
				var newValues = {$set: {todo: Arr}};
				dbo.collection("Boss").updateOne(myQuery, newValues);
			});
		});
	}
	else{
		res.sendFile("/template/error.html",{root:__dirname});	
	}
});

app.post("/todoDonePostBoss", function(req, res){
	if(typeof req.session.passport === "undefined"){
		res.sendFile("/template/error.html",{root:__dirname});
	}
	else if(typeof req.session.passport.user === "undefined"){
		res.sendFile("/template/error.html",{root:__dirname});	
	}
	else if(typeof req.session.passport.user.boss === "undefined"){
		res.sendFile("/template/error.html",{root:__dirname});	
	}
	else if(req.session.passport.user.boss == true){	
		mongo.connect(url, function(err, db){
			var dbo = db.db("MainDB");
			dbo.collection("Boss").findOne({name: req.session.passport.user.name}, function(err, doc){
				if(err) throw err;
				var myQuery = {name: req.session.passport.user.name};
				var Arr = doc.todoDone;
				Arr.push(req.body.todoDone);
				var newValues = {$set: {todoDone: Arr}};
				dbo.collection("Boss").updateOne(myQuery, newValues);
				var Arr2 = doc.todo;
				Arr2 = deleteDone(Arr2, req.body.todoDone);
				var newValues2 = {$set: {todo: Arr2}};
				dbo.collection("Boss").updateOne(myQuery, newValues2);
			});
		});
	}
	else{
		res.sendFile("/template/error.html",{root:__dirname});	
	}
});

app.post("/todoDeletePostBoss", function(req, res){
	if(typeof req.session.passport === "undefined"){
		res.sendFile("/template/error.html",{root:__dirname});
	}
	else if(typeof req.session.passport.user === "undefined"){
		res.sendFile("/template/error.html",{root:__dirname});	
	}
	else if(typeof req.session.passport.user.boss === "undefined"){
		res.sendFile("/template/error.html",{root:__dirname});	
	}
	else if(req.session.passport.user.boss == true){	
		mongo.connect(url, function(err, db){
			var dbo = db.db("MainDB");
			dbo.collection("Boss").findOne({name: req.session.passport.user.name}, function(err, doc){
				if(err) throw err;
				var myQuery = {name: req.session.passport.user.name};
				var Arr = doc.todoDone;
				Arr = deleteDone(Arr, req.body.todoDelete)
				var newValues = {$set: {todoDone: Arr}};
				dbo.collection("Boss").updateOne(myQuery, newValues);
			});
		});
	}
	else{
		res.sendFile("/template/error.html",{root:__dirname});	
	}
});

app.post("/todoPost", function(req, res){
	if(typeof req.session.passport === "undefined"){
		res.sendFile("/template/error.html",{root:__dirname});
	}
	else if(typeof req.session.passport.user === "undefined"){
		res.sendFile("/template/error.html",{root:__dirname});	
	}
	else if(req.session.passport.user){	
		mongo.connect(url, function(err, db){
			var dbo = db.db("MainDB");
			dbo.collection("Employees").findOne({name: req.session.passport.user.name}, function(err, doc){
				if(err) throw err;
				var myQuery = {name: req.session.passport.user.name};
				var Arr = doc.todo;
				Arr.push(req.body.todo);
				var newValues = {$set: {todo: Arr}};
				dbo.collection("Employees").updateOne(myQuery, newValues);
			});
		});
	}
	else{
		res.sendFile("/template/error.html",{root:__dirname});	
	}
});

app.post("/todoDonePost", function(req, res){
	if(typeof req.session.passport === "undefined"){
		res.sendFile("/template/error.html",{root:__dirname});
	}
	else if(typeof req.session.passport.user === "undefined"){
		res.sendFile("/template/error.html",{root:__dirname});	
	}
	else if(req.session.passport.user){	
		mongo.connect(url, function(err, db){
			var dbo = db.db("MainDB");
			dbo.collection("Employees").findOne({name: req.session.passport.user.name}, function(err, doc){
				if(err) throw err;
				var myQuery = {name: req.session.passport.user.name};
				var Arr = doc.todoDone;
				Arr.push(req.body.todoDone);
				var newValues = {$set: {todoDone: Arr}};
				dbo.collection("Employees").updateOne(myQuery, newValues);
				var Arr2 = doc.todo;
				Arr2 = deleteDone(Arr2, req.body.todoDone);
				var newValues2 = {$set: {todo: Arr2}};
				dbo.collection("Employees").updateOne(myQuery, newValues2);
			});
		});
	}
	else{
		res.sendFile("/template/error.html",{root:__dirname});	
	}
});

app.post("/todoDeletePost", function(req, res){
	if(typeof req.session.passport === "undefined"){
		res.sendFile("/template/error.html",{root:__dirname});
	}
	else if(typeof req.session.passport.user === "undefined"){
		res.sendFile("/template/error.html",{root:__dirname});	
	}
	else if(req.session.passport.user){	
		mongo.connect(url, function(err, db){
			var dbo = db.db("MainDB");
			dbo.collection("Employees").findOne({name: req.session.passport.user.name}, function(err, doc){
				if(err) throw err;
				var myQuery = {name: req.session.passport.user.name};
				var Arr = doc.todoDone;
				Arr = deleteDone(Arr, req.body.todoDelete)
				var newValues = {$set: {todoDone: Arr}};
				dbo.collection("Employees").updateOne(myQuery, newValues);
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
					Announcements.push({id: result[i].id, date: result[i].date,announcement: result[i].announcement})
				}
				dbo.collection("Messages").find().toArray(function(err, result){
					var Messages = [];
					for(var i=0; i<result.length; i++){
						Messages.push(result[i]);
					}
					if(req.params.type == "employees" && typeof req.session.passport.user.boss === "undefined"){
						dbo.collection("Applications").find().toArray(function(err, result){
								dbo.collection("Employees").findOne({username: req.session.passport.user.username}, function(err, doc){
								if(err) throw err;
								if(doc){
									var Arr = [];
									for(var i=0; i<result.length; i++){
										if(result[i].status == "Pending"){
											for(var j=0; j<result[i].employees.length; j++){
												if(result[i].employees[j] == req.session.passport.user.name && (typeof result[i].comments[j] === "undefined" || result[i].comments[j] == "") && (j==0 || typeof result[i].comments[j-1] != "undefined")){
													Arr.push(result[i]);
													break;
												}
											}
										}
									}
									res.render("employee", {name: req.session.passport.user.name, username: req.session.passport.user.username, announcements: Announcements, messages: Messages, todoList: doc.todo, todoDoneList: doc.todoDone, applications: Arr});
								}
							});
						});
					}
					else if(req.params.type == "boss" && req.session.passport.user.boss == true){
						dbo.collection("Applications").find().toArray(function(err, result){
								dbo.collection("Boss").findOne({username: req.session.passport.user.username}, function(err, doc){
								if(err) throw err;
								if(doc){
									res.render("boss", {name: req.session.passport.user.name, username: req.session.passport.user.username, announcements: Announcements, messages: Messages, todoList: doc.todo, todoDoneList: doc.todoDone, applications: result});
								}
							});
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
				var newValues = {$set: {"name" : req.body.name, "username" : req.body.username, "designation" : req.body.designation, "phone" : req.body.phone, "mobile" : req.body.mobile, "email" : req.body.email, "gender" : req.body.gender, "address" : req.body.address, "nationality" : req.body.nationality, "dob" : req.body.dob, "adhaar" : req.body.adhaar, "account" : req.body.account, "joining" : req.body.joining, "marital" : req.body.marital, "todo" : doc.todo, "todoDone" : doc.todoDone}}
				dbo.collection("Employees").updateOne(myQuery, newValues);
			});
			var dbo2 = db.db("LoginDetails");
			dbo2.collection("Employees").findOne({username: req.params.emp_username}, function(err, doc){
				var myQuery = {username: req.params.emp_username};
				var newValues = {$set: {name: req.body.name, username: req.body.username}}
				dbo2.collection("Employees").updateOne(myQuery, newValues);
				//alert
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
				var newValues = {$set: req.body};
				dbo.collection("Boss").updateOne(myQuery, newValues);
			});
			var dbo2 = db.db("LoginDetails");
			dbo2.collection("Boss").findOne({username: req.params.username}, function(err, doc){
				var myQuery = {username: req.params.username};
				var newValues = {$set: {name: req.body.name, username: req.body.username}};
				dbo2.collection("Boss").updateOne(myQuery, newValues);
				//alert
				res.redirect("/boss/" + req.params.username + "/profile");
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
  .get("/addEmployee", function(req,res){
	  if(typeof req.session.passport === "undefined"){
		  res.sendFile("/template/error.html",{root:__dirname});
	  }
	  else if(typeof req.session.passport.user === "undefined"){
		  res.sendFile("/template/error.html",{root:__dirname});	
	  }
	  else if(typeof req.session.passport.user.boss === "undefined"){
		  res.sendFile("/template/error.html",{root:__dirname});
	  }
	  else if(req.session.passport.user.boss){
		  res.render("create_emp",{username: req.session.passport.user.username});
	  }
	  else{
		  res.sendFile("/template/error.html",{root:__dirname});	
	  }
  });

  app.use(function(req,res,next) {
	res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
	next();
  })
  .get("/addBoss", function(req,res){
	  if(typeof req.session.passport === "undefined"){
		  res.sendFile("/template/error.html",{root:__dirname});
	  }
	  else if(typeof req.session.passport.user === "undefined"){
		  res.sendFile("/template/error.html",{root:__dirname});	
	  }
	  else if(typeof req.session.passport.user.boss === "undefined"){
		  res.sendFile("/template/error.html",{root:__dirname});
	  }
	  else if(req.session.passport.user.boss){
		  res.render("create_boss",{username: req.session.passport.user.username});
	  }
	  else{
		  res.sendFile("/template/error.html",{root:__dirname});	
	  }
  });

  app.post("/newEmployee", function(req, res){
	if(typeof req.session.passport === "undefined"){
		res.sendFile("/template/error.html",{root:__dirname});
	}
	else if(typeof req.session.passport.user === "undefined"){
		res.sendFile("/template/error.html",{root:__dirname});	
	}
	else if(typeof req.session.passport.user.boss === "undefined"){
		res.sendFile("/template/error.html",{root:__dirname});
	}
	else if(req.session.passport.user.boss){	
		if(req.body.password != req.body.conf_password){
			//alert
			res.redirect("/addEmployee");
		}
		else if(req.body.password == req.body.conf_password){
			mongo.connect(url, function(err, db){
				var dbo = db.db("LoginDetails");
				dbo.collection("Employees").insertOne({name: req.body.name, username: req.body.username, password: req.body.password})
				var dbo = db.db("MainDB");
				dbo.collection("Employees").insertOne({"name" : req.body.name, "username" : req.body.username, "designation" : req.body.designation, "phone" : req.body.phone, "mobile" : req.body.mobile, "email" : req.body.email, "gender" : req.body.gender, "address" : req.body.address, "nationality" : req.body.nationality, "dob" : req.body.dob, "adhaar" : req.body.adhaar, "account" : req.body.account, "joining" : req.body.joining, "marital" : req.body.marital, "todo" : [ ], "todoDone" : [ ]})
				dbo.collection("Employees").find().toArray(function(err,result){
					var EmployeesArr = [];
					for(var i=0; i<result.length; i++){
						EmployeesArr.push({name: result[i].name, designation: result[i].designation, phone: result[i].phone, mobile: result[i].mobile, email: result[i].email, username: result[i].username});
					}
					//alert
					res.redirect("/boss/" + req.user.username + "");
				});
			});
		}
	}
	else{
		res.sendFile("/template/error.html",{root:__dirname});	
	}
});

app.post("/newBoss", function(req, res){
	if(typeof req.session.passport === "undefined"){
		res.sendFile("/template/error.html",{root:__dirname});
	}
	else if(typeof req.session.passport.user === "undefined"){
		res.sendFile("/template/error.html",{root:__dirname});	
	}
	else if(typeof req.session.passport.user.boss === "undefined"){
		res.sendFile("/template/error.html",{root:__dirname});
	}
	else if(req.session.passport.user.boss){	
		if(req.body.password != req.body.conf_password){
			//alert
			res.redirect("/addBoss");
		}
		else if(req.body.password == req.body.conf_password){
			mongo.connect(url, function(err, db){
				var dbo = db.db("LoginDetails");
				dbo.collection("Boss").insertOne({name: req.body.name, username: req.body.username, password: req.body.password, boss: true})
				var dbo = db.db("MainDB");
				dbo.collection("Boss").insertOne({"name" : req.body.name, "username" : req.body.username, "designation" : req.body.designation, "phone" : req.body.phone, "mobile" : req.body.mobile, "email" : req.body.email, "gender" : req.body.gender, "address" : req.body.address, "nationality" : req.body.nationality, "dob" : req.body.dob, "adhaar" : req.body.adhaar, "account" : req.body.account, "joining" : req.body.joining, "marital" : req.body.marital, "todo" : [ ], "todoDone" : [ ]})
				dbo.collection("Employees").find().toArray(function(err,result){
					var EmployeesArr = [];
					for(var i=0; i<result.length; i++){
						EmployeesArr.push({name: result[i].name, designation: result[i].designation, phone: result[i].phone, mobile: result[i].mobile, email: result[i].email, username: result[i].username});
					}
					//alert
					res.redirect("/boss/" + req.user.username + "/contacts");
				});
			});
		}
	}
	else{
		res.sendFile("/template/error.html",{root:__dirname});	
	}
});

app.post("/employeesPost", function(req, res){
	if(typeof req.session.passport === "undefined"){
		res.sendFile("/template/error.html",{root:__dirname});
	}
	else if(typeof req.session.passport.user === "undefined"){
		res.sendFile("/template/error.html",{root:__dirname});	
	}
	else if(typeof req.session.passport.user.boss === "undefined"){
		res.sendFile("/template/error.html",{root:__dirname});		
	}
	else if(req.session.passport.user.boss){	
		mongo.connect(url, function(err, db){
			var dbo = db.db("MainDB");
			dbo.collection("Applications").findOne({id: req.body.id}, function(err, doc){
				var newValues = {$set: {status: "Pending", employees: req.body.employees, comments: []}};
				dbo.collection("Applications").updateOne({id: req.body.id}, newValues);
				res.redirect("/");
			});
		});
	}
	else{
		res.sendFile("/template/error.html",{root:__dirname});	
	}
});

app.post("/submitComment", function(req, res){
	if(typeof req.session.passport === "undefined"){
		res.sendFile("/template/error.html",{root:__dirname});
	}
	else if(typeof req.session.passport.user === "undefined"){
		res.sendFile("/template/error.html",{root:__dirname});	
	}
	else if(req.session.passport.user.name == req.body.employee){	
		mongo.connect(url, function(err, db){
			var dbo = db.db("MainDB");
			dbo.collection("Applications").findOne({id: req.body.id}, function(err, doc){
				var Arr = doc.comments;
				Arr.push(req.body.comment)
				if(Arr.length == doc.employees.length){
					var newValues = {$set: {comments: Arr, status: "Complete"}};
					dbo.collection("Applications").updateOne({id: req.body.id}, newValues);
					res.redirect("/");
				}
				else{
					var newValues = {$set: {comments: Arr}};
					dbo.collection("Applications").updateOne({id: req.body.id}, newValues);
					res.redirect("/");
				}
			})
		});
	}
	else{
		res.sendFile("/template/error.html",{root:__dirname});	
	}
});

app.post("/reportError", function(req, res){
	if(typeof req.session.passport === "undefined"){
		res.sendFile("/template/error.html",{root:__dirname});
	}
	else if(typeof req.session.passport.user === "undefined"){
		res.sendFile("/template/error.html",{root:__dirname});	
	}
	else if(req.session.passport.user.name == req.body.employee){	
		mongo.connect(url, function(err, db){
			var dbo = db.db("MainDB");
			dbo.collection("Applications").findOne({id: req.body.id}, function(err, doc){
				var Arr = doc.comments;
				Arr.push(req.body.comment)
				var newValues = {$set: {comments: Arr, status: "Error"}};
				dbo.collection("Applications").updateOne({id: req.body.id}, newValues);
				res.redirect("/");
			})
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