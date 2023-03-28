const Product = require('../models/productData');
const User = require('../models/userData');
const Order = require('../models/orderData');
const Coupon = require('../models/couponData');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

var instance = new Razorpay({
  key_id: process.env.KEY_ID,

  key_secret: process.env.KEY_SECRET,
});


const loadCheckOut = async (req, res) => {
  try {
    if (req.session.user_id) {
      const userId = req.session.user_id;
      const userdetails = await User.findOne({ _id: userId });
      const data = await User.findOne({ _id: userdetails._id });
      const use = await User.findById({ _id: userId });
      const completeUser = await use.populate("cart.product");
      const cartProducts = completeUser.cart;
      const addressDetail = data.address; // get the address array from data

      res.render("checkout", {
        userdetails: userdetails,
        datas: data,
        users: true,
        use: use,
        cartProducts: cartProducts,
        addressDetails: addressDetail // pass addressDetails to the template
      });
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
};


const successLoad = async (req, res) => {
  try {
    if (req.session.user_id) {

      let method = req.body.test



      if (method == "COD") {
        const userid = await User.findOne({ _id: req.session.user_id })
        const id = userid
        const orders = req.body
        const orderDetails = [];
        const productId = req.body.proId
        orders.product = orderDetails;
        if (!Array.isArray(orders.proId)) {
          orders.proId = [orders.proId]
        }
        if (!Array.isArray(orders.proQ)) {
          orders.proQ = [orders.proQ]
        }
        if (!Array.isArray(orders.qntyPrice)) {
          orders.qntyPrice = [orders.qntyPrice]
        }
        for (let i = 0; i < orders.proId.length; i++) {
          const productsId = orders.proId[i]
          const quantity = orders.proQ[i]
          const singleTotal = orders.qntyPrice[i]
          orderDetails.push({ productId: productsId, quantity: quantity, singleTotal: singleTotal })
        }

        // Update the product quantity in the Product collection
        for (let i = 0; i < orderDetails.length; i++) {
          const product = await Product.findById(orderDetails[i].productId);
          product.quantity -= orderDetails[i].quantity;
          await product.save();
        }

        const addressId = req.body.address; // get the selected address ID from the form
        const userData = await User.findById(id);
        const addressDetails = userData.address.find(address => address._id == addressId); // find the selected address details from the user's address array

        const order = new Order({
          userId: id,
          product: orders.product,
          total: orders.total1,
          deliveryAddress: addressDetails, // set the delivery address to the selected address details
          paymentType: orders.test,
          status: "Processing",
          orderId: `${uuidv4()}`,
          date: Date.now(),
          discount: req.body.discount1
        })
        if (!addressDetails) {
          return res.json({ address: true });
        } else {
          const saveData = await order.save();

        }
        await Coupon.updateOne({ code: req.body.code }, { $push: { userUsed: userid._id } })
      
        const removing = await User.updateOne({ _id: req.session.user_id }, {
          $pull: {
            cart: { product: { $in: productId } }
          },
          $set: { totalPrice: 0 }
        })

        // const userdetails = await User.findOne({ _id: req.session.user_id })
        // res.render('successpage', { userdetails: userdetails })
        res.json({ status: true })
      } else if (method == "UPI") {
        // CODE FOR UPI PAYMENT
        try {
          const userid = await User.findOne({ _id: req.session.user_id });
          const id = userid;

          const orders = req.body;
          const orderDetails = [];
          const productId = req.body.proId;
          orders.product = orderDetails;
          if (!Array.isArray(orders.proId)) {
            orders.proId = [orders.proId];
          }

          if (!Array.isArray(orders.proQ)) {
            orders.proQ = [orders.proQ];
          }

          if (!Array.isArray(orders.qntyPrice)) {
            orders.qntyPrice = [orders.qntyPrice];
          }

          for (let i = 0; i < orders.proId.length; i++) {
            const productId = orders.proId[i];
            const quantity = orders.proQ[i];
            const singleTotal = orders.qntyPrice[i];
            orderDetails.push({ productId: productId, quantity: quantity, singleTotal: singleTotal });
          }

          // Update the product quantity in the Product collection
          for (let i = 0; i < orderDetails.length; i++) {
            const product = await Product.findById(orderDetails[i].productId);
            product.quantity -= orderDetails[i].quantity;
            await product.save();
          }

          const addressId = req.body.address; // get the selected address ID from the form
          const userData = await User.findById(id);
          const addressDetails = userData.address.find(address => address._id == addressId); // find the selected address details from the user's address array

          const order = new Order({
            userId: id,
            product: orders.product,
            total: orders.total1,
            deliveryAddress: addressDetails, // set the delivery address to the selected address details
            paymentType: orders.test,
            status: "Processing",
            orderId: `${uuidv4()}`,
            date: Date.now(),
            discount: req.body.discount1,
          });
          if (!addressDetails) {
            return res.json({ address: true });
          } else {
            const saveData = await order.save();

          }

          await Coupon.updateOne({ code: req.body.code }, { $push: { userUsed: userid._id } })
          
          const latestOrder = await Order.findOne({}).sort({ date: -1 }).lean();


          if (latestOrder) {
            let options = {
              amount: orders.total * 100,
              currency: "INR",
              receipt: "" + latestOrder._id
            };
            instance.orders.create(options, function (err, order) {
             
              res.json({ viewRazorpay: true, order })
            });
          } else {
          
            res.json({ viewRazorpay: false }); // or handle the error as per your requirement
          }
        } catch (error) {
          console.log(error);
        }
      } else if (method == "wallet") {
        const userid = await User.findOne({ _id: req.session.user_id });
        const id = userid;
        let userdata = await User.findOne({ _id: req.session.user_id });

        if (req.body.total <= userdata.wallet) {
          const userid = await User.findOne({ _id: req.session.user_id });
          const id = userid;

          const orders = req.body;
          const orderDetails = [];
          const productId = req.body.proId;
          orders.product = orderDetails;

          if (!Array.isArray(orders.proId)) {
            orders.proId = [orders.proId];
          }
          if (!Array.isArray(orders.singlePrice)) {
            orders.singlePrice = [orders.singlePrice];
          }

          if (!Array.isArray(orders.proQ)) {
            orders.proQ = [orders.proQ];
          }

          if (!Array.isArray(orders.qntyPrice)) {
            orders.qntyPrice = [orders.qntyPrice];
          }

          for (let i = 0; i < orders.proId.length; i++) {
            const productId = orders.proId[i];
            const quantity = orders.proQ[i];
            const singleTotal = orders.qntyPrice[i];
            const singlePrice = orders.singlePrice[i];
            orderDetails.push({
              productId: productId,
              quantity: quantity,
              singleTotal: singleTotal,
              singlePrice: singlePrice,
            });
          }
          const addressId = req.body.address; // get the selected address ID from the form
          const userData = await User.findById(id);
          const addressDetails = userData.address.find(address => address._id == addressId); // find the selected address details from the user's address array
          const ordersave = new Order({
            userId: id,
            product: orders.product,
            total: req.body.total1,
            orderId: `order_id_${uuidv4()}`,
            deliveryAddress: addressDetails,
            paymentType: orders.test,
            date: Date.now(),
            discount: req.body.discount1,
            coupon: req.body.code,
          });
          const saveData = await ordersave.save();

          // Reduce wallet balance
          const balance = userdata.wallet - req.body.total1;
          const walletMinus = await User.updateOne(
            { _id: req.session.user_id },
            { $set: { wallet: balance } }
          );

          // Update coupon usage
          await Coupon.updateOne(
            { code: req.body.code },
            { $push: { userUsed: userid._id } }
          );

          // Remove items from cart and reset total price
          const removing = await User.updateOne(
            { _id: req.session.user_id },
            {
              $pull: { cart: { product: { $in: productId } } },
              $set: { totalPrice: 0 },
            }
          );
          res.json({ status: true });
        } else {
          res.json({ insufficiant: true });
        }
      }

      else {
        res.json({ radio: true });
      }
    } else {
      res.redirect('/login')
    }
  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
}




//verify payment 
const PaymentVerified = async (req, res) => {
  try {
    if (req.session.user_id) {
     

      const details = req.body



      let hmac = crypto.createHmac('sha256', process.env.KEY_SECRET)
      hmac.update(details.payment.razorpay_order_id + '|' + details.payment.razorpay_payment_id)
      hmac = hmac.digest('hex')

      const latestOrder = await Order
      .findOne({})
      .sort({ date: -1 })
      .lean();


      if (hmac == details['payment']['razorpay_signature']) {
       
       
        const change = await Order.updateOne({ _id: latestOrder._id }, { $set: { status: "Processing" } })
        for (let i = 0; i < latestOrder.product.length; i++) {
          const productId = latestOrder.product[i].productId;
  
          const removing = await User.updateOne(
            { _id: req.session.user_id },
            {
              $pull: { cart: { product: { $in: productId } } },
              $set: { totalPrice: 0 }
            }
          );

        }
        res.json({ status: true })
      } else {
       
        res.json({ failed: true })
      }
    } else {
      res.redirect('/login')
    }

  } catch (error) {
    console.log(error.message);
    res.render("500");
  }
}


//success get 

const orderConfirmation = async (req, res) => {
  try {
    if (req.session.user_id) {



      res.render('successpage')


    }

  } catch {
    console.log(error.message);
    res.render("500");
  }
}



module.exports = {
  loadCheckOut,
  successLoad,
  PaymentVerified,

  orderConfirmation
}