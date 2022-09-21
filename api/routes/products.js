const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");

const checkAuth = require("../middleware/check-auth");

// const upload = multer({dest: "uploads/"}); // ruta relativa --> crea una carpeta uploads a partir del directorio raiz del proyecto, no a partir de c: como haria si pusieramos /uploads/
// En lugar de usar multer de esta forma, lo haremos mas detalladamente debajo -->

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "uploads/");
		console.log("Pasamos por aqui - archivo guardado");
		//cb(null, "./uploads/");
	},
	filename: (req, file, cb) => {
		// cb(null, `${new Date().toISOString()}${file.filename}`);
		console.log(`Pasamos por aqui - el nombre del archivo es: ${new Date().toISOString().replace(/:/g, '-')}-${file.originalname}`);
		cb(null, `${new Date().toISOString().replace(/:/g, '-')}-${file.originalname}`);
	}
});

// Esta funcion es para limitar el tipo de archivo que se va a subir, en este caso unicamente aceptara archivos de imagen .jpeg y .png
const fileFilter = (req, file, cb) => {
	if(file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
		console.log(`Pasamos por aqui - el formato del archivo coincide ${file.mimetype}`);
		cb(null, true);
	} else {
		console.log(`Pasamos por aqui - el formato del archivo NO coincide ${file.mimetype}`);
		cb(null, false);
	}
};

// la propiedad limits es para especificar una capacidad maxima en bytes, en este caso 5 Mb
// La propiedad fileFilter es para limitar el tipo de archivo a subir (solo admite .jpeg y .png)
const upload = multer({
	storage: storage, 
	limits: {
		fileSize: 1024 * 1024 * 5
	},
	fileFilter: fileFilter
}); 


const Product = require("../models/product");

router.get("/", (req, res, next) => {
	/*res.status(200).json({
		message: "Handling GET requests to /products"
	});*/
	
	Product.find()
		.select("_id name price productImage")
		.exec()
		.then(products => {
			console.log("Products: ", products);
			const response = {
				count: products.length,
				products: products.map(product => {
					return {
						_id: product._id,
						name: product.name,
						price: product.price,
						productImage: `http://localhost:3080/${product.productImage.replace(/\\+/g, '/')}`,
						request: {
							method: 'GET',
							url: `http://localhost:3080/products/${product._id}`
						}
					}
				})
			};
			res.status(200).json({response});
		})
		.catch(err => {
			console.log("Errors: ", err);
			res.status(500).json({error: err});
		});
});

// router.post("/", upload.single("productImage"), checkAuth, (req, res, next) => { // Aqui necesitamos poner el middleware checkAuth despues del de la subida del archivo, si queremos enviar el token como parametro de tipo "form data" en el postman	
// En este caso se puede utilizar el middleware checkAuth antes del de la subida de archivo, y para poder hacerlo tenemos que enviar el token como el valor del parametro "Authorization" EN EL HEADER, asi no necesitamos parsear el token
router.post("/", checkAuth, upload.single("productImage"), (req, res, next) => {
	const newProduct = new Product({
		_id: new mongoose.Types.ObjectId(),
		name: req.body.name,
		price: req.body.price,
		productImage: req.file.path,
		date_product: new Date().toISOString()
	});
	
	console.log("req.file.path: ", req.file.path);
	
	newProduct.save()
		.then(result => {
			console.log("Esto es lo que recibo del server: ", result);
			res.status(200).json({
				message: `Product ${result._id} created successfully !!!`,
				createdProduct: {
					_id: result._id,
					name: result.name,
					price: result.price,
					productImage: `http://localhost:3080/${req.file.path.replace(/\\+/g, '/')}`,
					request: {
							method: 'GET',
							url: `http://localhost:3080/products/${result._id}`
						}
					}
				});
			})
		.catch(err => {
			console.log(err);
			res.status(500).json({error: err});
		})
});

router.get("/:productId", (req, res, next) => {
	const id = req.params.productId;
	
	Product.findById(id)
		.select("_id name price productImage")
		.exec()
		.then(product => {
			console.log("Product: ", product);
			if(product) {
				res.status(200).json({
					_id: product._id,
					name: product.name,
					price: product.price,
					date_product: product.date_product
				});
			} else {
				res.status(404).json({message: `No product for id ${id}`});
			}			
		})
		.catch(err => {
			console.log(err);
			res.status(500).json(err);
		});
	
	/*if(id === "special") {
		res.status(200).json({
			message: "You discovered the special ID",
			id
		});

	} else {
		res.status(200).json({
			message: "You passed an ID",
			id
		});
	}*/
});

router.patch("/:productId", checkAuth, (req, res, next) => {
	const id = req.params.productId;
	
	const updateOps = {};
	
	for(const ops of Object.entries(req.body)) {
		// console.log("mapeado del patch");
		// console.log("ops", ops);
		// console.log("Object.keys: ", Object.keys(ops));
		// console.log("Object.values: ", Object.values(ops));
		updateOps[ops[0]] = ops[1];
	}
	
	updateOps.date_product = new Date().toISOString();
	
	// Cambiar el metodo update (deprecado) por updateOne o UpdateMany
	Product.update({_id: id}, {$set: updateOps})
		.exec()
		.then(product => {
			console.log(`Product with id ${id} updated. `, product);
			if(product) {
				res.status(200).json({
					...product, 
					message: `Product with id ${id} updated.`,
					request: {
						method: "GET",
						url: `http://localhost:3080/products/${id}`
					}
				});
			} else {
				res.status(404).json({message: `No product for id ${id}`});
			}			
		})
		.catch(err => {
			console.log(err);
			res.status(500).json(err);
		});
	
	/*res.status(200).json({
		message: `Product with id ${id} updated`,
		id
	});*/
});

router.delete("/:productId", checkAuth, (req, res, next) => {
	const id = req.params.productId;
	
	Product.remove({_id: id})
		.exec()
		.then(product => {
			console.log(`Product with id ${id} deleted. `, product);
			if(product) {
				res.status(200).json({
					message: `Product with id ${id} deleted !!!`
				});
			} else {
				res.status(404).json({message: `No product for id ${id}`});
			}			
		})
		.catch(err => {
			console.log(err);
			res.status(500).json(err);
		});
	
	/*res.status(200).json({
		message: `Product with id ${id} deleted`,
		id
	});*/
});
	

module.exports = router;