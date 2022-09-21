const express = require("express");
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require("mongoose");

var fs = require('node:fs');
var fsPromises = require('node:fs/promises');

const productRoutes = require("./api/routes/products");
const orderRoutes = require("./api/routes/orders");
const userRoutes = require("./api/routes/user");

// Youtube URL con el mix de todos los videos de academind -->https://www.youtube.com/watch?v=_EP2qCmLzSE&list=PL55RiY5tL51q4D-B63KBnygU6opNPFk_q&index=11

// IMPORTANT !!! UNCOMMENT THE LINE BELOW TO BE ABLE TO CONNECT TO THE DATABASE - REPLACE USER, PASS AND CLUSTER DB
// mongoose.connect("mongodb+srv://username:password@nombredelclusterdemongo/?retryWrites=true&w=majority");

// Esta instruccion se utiliza para que no aparezca el warning que dice que el metodo update esta deprecated (no funciona)
// mongoose.Promise = global.Promise;

app.use(morgan('dev'));

// Hacer publica la carpeta uploads donde se almacenan las imagenes subidas, para que el cliente tenga acceso a ellas a traves del navegador, 
// por ejemplo http://localhost:3080/uploads/2022-09-14T09-57-49.821Z-node-237.jpg --> solo que en este caso no accederiamos a la carpeta uploads, sino al archivo directamente despues del dominio y el puerto -->
// quedaria asi --> http://localhost:3080/2022-09-14T09-57-49.821Z-node-237.jpg
// app.use(express.static("uploads"));

// Para corregir esto y que podamos acceder a la imagen desde su ruta exacta, modificamos el app.use asi:
app.use("/uploads", express.static("uploads"));


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// CORS Error Handling
app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
	
	if(req.method === "OPTIONS") {
		res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
		return res.status(200).json({});
	}
	next();
});

// Routes which should handle requests
app.use("/products", productRoutes);
app.use("/orders", orderRoutes);
app.use("/user", userRoutes);

app.get("/readJson", async (req, res, next) => {
  var destination = 'api/utils/log_cfg';	
  try {
	  fs.accessSync(destination, fs.constants.R_OK | fs.constants.W_OK);console.log(`${destination} folder can read/write`);
  } catch (err){
	  console.error(`no access to ${destination} folder`, err);
	  res.status(500).json({err: `${err}`});
  }
  try {
    var promise = fsPromises.readFile("./api/utils/log_cfg/test.json").then(async (resp) => {
		const pruebaArrayBufferToBuffer = Buffer.from(resp);
		return res.status(200).send(pruebaArrayBufferToBuffer);			
	});
  } catch (err) {
    console.error(err);
	res.status(500).json({err: `${err}`});
  }  
});

app.use((req, res, next) => {
	console.log('pasamos por aqui');
	const error = new Error('Not found');
	error.status = 404;
	next(error);
});

app.use((error, req, res, next) => {
	res.status(error.status || 500);
	res.json({
		message: `${error.message}`
	});
});

module.exports = app;