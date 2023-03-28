const order = require('../models/orderData');

//  retrieves all order details
const viewOrder = async (req, res) => {
  try {
    // Retrieve all order details from the database
    const orderDetails = await order.find({});

    // Initialize empty arrays for orders and users
    const orders = [];
    const users = [];

    // If there are any orders
    if (orderDetails.length > 0) {
      // Loop through each order
      for (let i = 0; i < orderDetails.length; i++) {
        // Retrieve the current order
        const currentOrder = orderDetails[i];

        // Populate the current order with the product and user information
        const populatedOrder = await order
          .findById(currentOrder._id)
          .populate('product.productId')
          .populate('userId');

        // Push the populated order and user to their respective arrays
        orders.push(populatedOrder);
        users.push(populatedOrder.userId);
      }
    }

    // Render the adminorder view with the orders, users, and orderDetails arrays
    res.render('adminorder', {
      order: orders,
      user: users,
      orderDetail: orderDetails
    });

  } catch (error) {
    // Log any errors that occur
    console.log(error.message);
    res.render("500");
  }
};

const dropdown = async (req, res) => {
  try {
    // Extract the orderId and status from the request body
    const orderId = req.body.orderId;
    const status = req.body.status;

    // Find the order in the database based on the orderId
    const orderData = await order.findOne({ orderId: orderId });

    // Update the status of the order in the database
    await order.updateOne({
      orderId: orderId
    }, {
      $set: {
        status: status
      }
    });

    // Add a new entry to the orderStatus array of the order to record the status
    // update
    orderData
      .orderStatus
      .push({ status: status, date: new Date() });
    await orderData.save();

    // Redirect the user
    res.redirect('/admin/order');

  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};
// details for a specific order
const orderDetails = async (req, res) => {
  try {
    // Retrieve the ID of the order from the URL parameter
    const id = req.params.id;
    // Query the database for the order data and populate the product and user
    // fields
    const orderData = await order
      .findOne({ _id: id })
      .populate('product.productId')
      .populate('userId');
    // Render the order details page with the retrieved data
    res.render('orderdetail', { orderdetails: orderData });
  } catch (error) {
    // If an error occurs, log it to the console
    console.log(error.message);
    res.render("500");
  }
};

module.exports = {
  viewOrder,
  dropdown,
  orderDetails
}