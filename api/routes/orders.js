const express = require("express");
const router = express.Router();

const mongoose = require("mongoose");

const Order = require("../models/order");
const Product = require("../models/product");

const checkAuth = require("../middleware/check-auth");
const OrdersController = require("../controllers/orders");

router.get("/", checkAuth, OrdersController.orders_get_all);
router.post("/", checkAuth, OrdersController.orders_create_order);

/*router.get("/", checkAuth, (req, res, next) => {
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
});

router.post("/", checkAuth, (req, res, next) => {
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
});*/

router.get("/:orderId", checkAuth, (req, res, next) => {
	/*const orderId = req.params.orderId;
	
	res.status(200).json({
		message: `Details for order with id ${orderId}`,
		orderId
	});*/
	
	Order.findById(req.params.orderId)
		.populate("product")
		.exec()
		.then(order => {
			res.status(200).json({
				order,
				request: {
					method: "GET",
					url: `http://localhost:3080/orders/`
				}
			});
		})
		.catch(err => {
			res.status(500).json({error: err});
		});
});

router.delete("/:orderId", checkAuth, (req, res, next) => {
	const orderId = req.params.orderId;
	
	/*res.status(200).json({
		message: `Order with id ${orderId} deleted !!!`,
		orderId
	});*/
	
	console.log("req.params.orderId: ", orderId);
	
	Order.remove({_id: orderId})
		.exec()
		.then(order => {
			res.status(200).json({
				message: `Order with id ${orderId} deleted !!!`,
				order
			});
		})
		.catch(err => {
			res.status(500).json({error: err});
		});
});
	

module.exports = router;
