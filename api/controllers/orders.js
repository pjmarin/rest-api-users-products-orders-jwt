const mongoose = require("mongoose");

const Order = require("../models/order");
const Product = require("../models/product");

const OrdersController = {
	orders_get_all: (req, res, next) => {		
		Order
			.find()
			.select("_id product quantity")
			// En populate, el primer parametro hace referencia a product, porque coincide la id del product con la id del order, el segundo parametro coincide con el listado de propiedades del product que se devolveran en la response
			.populate("product", "name")
			.then(orders => {
				res.status(201).json({
					count: orders.length,
					orders: orders.map(order => {
						return {
							_id: order._id,
							product: order.product,
							quantity: order.quantity,
							request: {
								method: "GET",
								url: `http://localhost:3080/orders/${order._id}`
							}
						}
					})				
				});
			})
			.catch(err => {
				console.log(`Error while trying to get orders: `, err);
				res.status(500).json({
					message: `Error while trying to get orders: ${err}`
				});
			});
	},
	orders_create_order: (req, res, next) => {
		Product.findById(req.body.productId)
			.then(product => {
				if(!product) {
					return res.status(500).json({
						message: `Error: Product with id: ${req.body.productId} doesn't exist. Order failed !!!`,
						description: err
					});
				}
				/*const order = {
					productId: req.body.productId,
					quantity: req.body.quantity
				};*/
				
				const order = new Order({
					_id: new mongoose.Types.ObjectId(),
					quantity: req.body.quantity,
					product: req.body.productId,
					date_order: new Date().toISOString()
				});
				
				order
					.save()
					.then(result => {
						console.log(`Order ${order._id} created successfully !!!`, result);
						res.status(201).json({
							message: `Order ${order._id} created successfully !!!`,
							order
						});
					})
					.catch(err => {
						console.log(`Error while trying to create order ${order._id}`, err);
						res.status(500).json({
							message: `Error while trying to create order ${order._id}`,
							description: err
						});
					});
			})
			.catch(err => {
				console.log(`Error: Product with id: ${req.body.productId} doesn't exist. Order failed !!!`, err);
				res.status(500).json({
					message: `Error: Product with id: ${req.body.productId} doesn't exist. Order failed !!!`,
					description: err
				});
			});
	}
};

module.exports = OrdersController;

/*module.exports.orders_get_all = (req, res, next) => {
	/*res.status(200).json({
		message: "Orders were fetched !!!"
	});*/
	
	/*Order
		.find()
		.select("_id product quantity")
		// En populate, el primer parametro hace referencia a product, porque coincide la id del product con la id del order, el segundo parametro coincide con el listado de propiedades del product que se devolveran en la response
		.populate("product", "name")
		.then(orders => {
			console.log(`Total Orders: `, orders);
			res.status(201).json({
				count: orders.length,
				orders: orders.map(order => {
					return {
						_id: order._id,
						product: order.product,
						quantity: order.quantity,
						request: {
							method: "GET",
							url: `http://localhost:3080/orders/${order._id}`
						}
					}
				})				
			});
		})
		.catch(err => {
			console.log(`Error while trying to get orders: `, err);
			res.status(500).json({
				message: `Error while trying to get orders: ${err}`
			});
		});
};

module.exports.orders_create_order = (req, res, next) => {
	Product.findById(req.body.productId)
		.then(product => {
			if(!product) {
				return res.status(500).json({
					message: `Error: Product with id: ${req.body.productId} doesn't exist. Order failed !!!`,
					description: err
				});
			}
			/*const order = {
				productId: req.body.productId,
				quantity: req.body.quantity
			};*/
			
			/*const order = new Order({
				_id: new mongoose.Types.ObjectId(),
				quantity: req.body.quantity,
				product: req.body.productId,
				date_order: new Date().toISOString()
			});
			
			order
				.save()
				.then(result => {
					console.log(`Order ${order._id} created successfully !!!`, result);
					res.status(201).json({
						message: `Order ${order._id} created successfully !!!`,
						order
					});
				})
				.catch(err => {
					console.log(`Error while trying to create order ${order._id}`, err);
					res.status(500).json({
						message: `Error while trying to create order ${order._id}`,
						description: err
					});
				});
		})
		.catch(err => {
			console.log(`Error: Product with id: ${req.body.productId} doesn't exist. Order failed !!!`, err);
			res.status(500).json({
				message: `Error: Product with id: ${req.body.productId} doesn't exist. Order failed !!!`,
				description: err
			});
		});
};*/
