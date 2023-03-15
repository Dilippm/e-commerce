const order = require ('../models/orderData');

const viewOrder = async (req, res) => {
    try {
      const orderDetails = await order.find({});
      const orders = [];
      const users = [];
      if (orderDetails.length > 0) {
        for (let i = 0; i < orderDetails.length; i++) {
          const currentOrder = orderDetails[i];
          const populatedOrder = await order
            .findById(currentOrder._id)
            .populate('product.productId')
            .populate('userId');
          orders.push(populatedOrder);
          users.push(populatedOrder.userId);
        }
      }
      res.render('adminorder', { order: orders, user: users, orderDetail: orderDetails });
    } catch (error) {
      console.log(error.message);
    }
  };
  const dropdown = async (req, res) => {
    try {
      const orderId = req.body.orderId;
      const status = req.body.status;
      const orderData = await order.findOne({ orderId: orderId });
     
      await order.updateOne({ orderId: orderId }, { $set: { status: status } });
      orderData.orderStatus.push({ status: status, date: new Date() });
      await orderData.save();
      res.redirect('/admin/order');
    } catch (error) {
      console.log(error.message);
    }
  };
  const orderDetails = async (req, res) => {
    try {
      const id = req.params.id;
      const orderData = await order.findOne({ _id: id }).populate('product.productId').populate('userId');
      res.render('orderdetail', { orderdetails: orderData });
    } catch (error) {
      console.log(error.message);
    }
  };
module.exports={
    viewOrder,
    dropdown,
    orderDetails
}