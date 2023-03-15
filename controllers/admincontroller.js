const admin = require('../models/adminData');
const Product = require('../models/productData');
const User = require('../models/userData');
const Order = require('../models/orderData');
const Category = require('../models/categoryData');
const moment = require('moment');

//Renders the admin login page
const adminRegister = async (req, res) => {
  try {
      // Render the admin login page
      res.render('adminlogin');

  } catch (error) {
      // Log any errors that occur
      console.log(error.message);
  }
}

const verifylogin = async (req, res) => {
    try {
        const email = req.body.email
        const password = req.body.password

        const adminData = await admin.findOne({email: email, password: password});

        if (adminData) {

            req.session.admin_id = adminData._id;
            res.redirect('/admin/dashboard')
        } else {
            res.render('adminlogin', {message: "invalid email or password"})
        }

    } catch (error) {
        console.log(error.message)
    }
}
const loadDashboard = async (req, res) => {
    try {
        const categoryData = await Category.find({});
        const productData = await Product
            .find({})
            .populate('category')
            .exec();

        const salesCount = await Order
            .find({status: "Delivered"})
            .count();
        const totalUsers = await User
            .find({})
            .count();
        const weeklyRevenue = await Order.aggregate([
            {
                $match: {
                    date: {
                        $gte: new Date(new Date().setDate(new Date().getDate() - 7))
                    }
                }
            }, {
                $match: {
                    status: 'Delivered'
                }
            }, {
                $group: {
                    _id: null,
                    totalAmount: {
                        $sum: '$total'
                    }
                }
            }
        ]);

        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        const usersForTheLastWeek = await User.find({
            date: {
                $gte: lastWeek
            }
        });

        const salesChart = await Order.aggregate([
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: '$date'
                        }
                    },
                    sales: {
                        $sum: '$total'
                    }
                }
            }, {
                $sort: {
                    _id: 1
                }
            }, {
                $limit: 7
            }
        ]);

        const date = salesChart.map((item) => {
            return item._id;
        });

        const sales = salesChart.map((item) => {
            return item.sales;
        });

        const pending = await Order
            .find({status: 'Pending'})
            .count();
        const processing = await Order
            .find({status: 'Processing'})
            .count();
        const delivered = await Order
            .find({status: 'Delivered'})
            .count();
        const shipped = await Order
            .find({status: 'Shipped'})
            .count();
        const cancelled = await Order
            .find({status: 'Cancelled'})
            .count();
        const Returned = await Order
            .find({status: 'Retrun Pending'})
            .count();
        const UPI = await Order
            .find({paymentType: 'UPI'})
            .count();
        const COD = await Order
            .find({paymentType: 'COD'})
            .count();
        const wallet = await Order
            .find({paymentType: 'wallet'})
            .count();

        const topSellingProducts = await Order.aggregate([
            {
                $unwind: '$product'
            }, {
                $group: {
                    _id: '$product.productId',
                    orderedQuantities: {
                        $push: '$product.quantity'
                    },
                    totalRevenue: {
                        $sum: {
                            $multiply: ['$product.quantity', '$product.price']
                        }
                    }
                }
            }, {
                $project: {
                    _id: 1,
                    totalQuantityOrdered: {
                        $reduce: {
                            input: '$orderedQuantities',
                            initialValue: 0, in: {
                                $add: ['$$value', '$$this']
                            }
                        }
                    },
                    totalRevenue: 1
                }
            }, {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'product'
                }
            }, {
                $unwind: '$product'
            }, {
                $sort: {
                    totalQuantityOrdered: -1
                }
            }, {
                $limit: 10
            }, // limit to top 10 products
        ]);

        const recentSales = await Order
            .find({})
            .sort({date: -1})
            .limit(10)
            .populate('userId', 'name') // populate user name
            .populate({
                path: 'product.productId', select: 'productName price', // select product name and price
            })
            .populate({
                path: 'orderStatus', select: 'status', // select only the status field

            })
            .exec();
        res.render('dashboard', {
            totalUsers,
            salesCount,
            productData,
            categoryData,
            weeklyRevenue,

            usersForTheLastWeek,
            processing,
            pending,
            delivered,
            shipped,
            cancelled,
            Returned,
            UPI,
            COD,
            wallet,
            sales,
            date,
            moment,
            topSellingProducts,
            recentSales
        });
    } catch (error) {
        console.log(error.message);
    }
};

const adminLogout = async (req, res) => {
    try {
        req.session.admin_id = null
        res.redirect('/admin')
    } catch (error) {
        console.log(error.message)
    }
}

const viewDailySalesReport = async (req, res) => {
    try {
        const orders = await Order
            .find()
            .populate({path: "product.productId", select: "productName price"});

        // Create a new object to store total sales for each product by day
        const salesByDayAndProduct = {};

        // Iterate over each order and update salesByDayAndProduct with the total sales
        // for each product by day
        orders.forEach((order) => {
            const orderDate = new Date(order.date);
            const day = orderDate
                .toISOString()
                .substring(0, 10);

            order
                .product
                .forEach((product) => {
                    const productName = product.productId.productName;
                    const productSalesTotal = product.quantity * product.productId.price;

                    if (!(day in salesByDayAndProduct)) {
                        salesByDayAndProduct[day] = {};
                    }

                    if (productName in salesByDayAndProduct[day]) {
                        salesByDayAndProduct[day][productName].quantitySold += product.quantity;
                        salesByDayAndProduct[day][productName].totalSales += productSalesTotal;
                    } else {
                        salesByDayAndProduct[day][productName] = {
                            quantitySold: product.quantity,
                            totalSales: productSalesTotal
                        };
                    }
                });
        });

        res.render("salesreport", {salesByDayAndProduct});
    } catch (error) {
        console.log(error.message);
    }
};

module.exports = {
    adminRegister,
    verifylogin,
    loadDashboard,

    adminLogout,
    viewDailySalesReport
}
