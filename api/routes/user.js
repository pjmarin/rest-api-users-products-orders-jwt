const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");

const User = require("../models/user");

router.post("/signup", (req, res, next) => {
	User.find({email: req.body.email})
		.exec()
		.then(user => {
			if(user.length >= 1) {
				// return res.status(422).json({message: `User with email ${req.body.email} already exists !!! Please use another email address.`});
				return res.status(409).json({message: `User with email ${req.body.email} already exists !!! Please use another email address.`});
			} else {
				bcrypt.hash(req.body.password, 10, (err, hash) => {
					if(err) {
						res.status(500).json({error: err});
					} else {
						const user = new User({
							_id: new mongoose.Types.ObjectId(),
							createdAt: new Date().toISOString(),
							email: req.body.email,
							password: hash
							// password: req.body.password
						});
						
						user
							.save()
							.then(userCreated => {
								res.status(201).json({ message: `User with id ${user._id} has been created successfully !!!`});
							})
							.catch(err => {
								console.log("Error when trying to create user: ", err);
								res.status(500).json({error: `Error when trying to create user - ${err}`});
							})
					}
				});
			}
		})
		.catch(err => {console.log("Error when trying to create user: ", err); res.status(500).json({error: `Error when trying to create user - ${err}`});})
});

router.delete("/:userId", (req, res, next) => {
	User.remove({_id: req.params.userId})
		.exec()
		.then(user => {
			res.status(200).json({message: `User with id ${req.params.userId} has been deleted successfully !!!`});
		})
		.catch(err => {
			console.log("Error when trying to delete user: ", err);
			res.status(500).json({error: `Error when trying to delete user - ${err}`});
		});
});

router.post("/login", (req, res, next) => {
	// Podriamos usar findOne aqui --> User.findOne({email: req.body.email})	
	// De momento usaremos find
	
	console.log("pasamos por aqui - antes de buscar el usuario");
	User.find({email: req.body.email })
		.exec()
		.then(user => {
			console.log("pasamos por aqui - despues de buscar el usuario");
			console.log("el usuario es: ", user);
			if(user.length < 1) {
				console.log("no se ha encontrado ningun usuario");
				// res.status(404).json({message: `User with email ${req.params.email} doesn't exist !!!`});
				res.status(401).json({message: 'Auth failed'}); // Solo responderemos con auth failed para no dar pistas a posibles hackers de si existe o no el email con el que se ha intentado logar
			}
			
			bcrypt.compare(req.body.password, user[0].password, function (error, response) {
				if(error) {
					console.log("pasamos por aqui - despues de comparar el password - error: ", error);
					return res.status(401).json({message: 'Auth failed'});
				}
				
				if(response) {
					const secretKey = "secret";
					
					const token = jwt.sign({userId: user[0]._id, email: user[0].email}, secretKey, {expiresIn: "1h"});
					
					console.log("pasamos por aqui - despues de comparar el password - parece que el password es correcto !!!");
					return res.status(200).json({message: 'Auth successful !!!', token: token});
				}
			});
			
		})
		.catch(err => {
			console.log("Error when trying to log user: ", err);
			res.status(500).json({error: `Error when trying to log user - ${err}`});
		});
});

router.get("/", (req, res, next) => {
	
});

router.get("/", (req, res, next) => {
	
});

router.get("/:user", (req, res, next) => {
	
});

router.patch("/:user", (req, res, next) => {
	
});	

module.exports = router;

// "permissions": "-rwxrwxrwx",