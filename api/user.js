const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	email:  { 
		type: String, 
		required: true, 
		unique: true, // unique aqui no hace ningun tipo de validacion, solo es usado para indexar y para performance en la busqueda de user.email
		match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
	},
	password: { type: String, required: true },
	createdAt: Date
});

module.exports = mongoose.model("User", userSchema);