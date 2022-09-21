const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
	try {
		const token = req.headers.authorization.split(" ")[1];
		console.log("El token recibido es: ", token);
		// const decoded = jwt.verify(req.body.token, "secret"); // Esto seria si cogieramos el token como parametro de tipo "form data" desde postman
		const decoded = jwt.verify(token, "secret"); // De esta forma, accedemos al token enviado desde el header con el parametro "Authorization"
		req.userData = decoded;
		next();
	} catch(e) {
		return res.status(401).json({
			error: 'Auth failed'
		});
	}
};
